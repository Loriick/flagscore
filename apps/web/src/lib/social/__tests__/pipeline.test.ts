import { describe, expect, it } from "vitest";

import { postImageUrls, type ApifyPost } from "../apify";
import type { Extraction } from "../extract";
import { toObservations } from "../extract";
import {
  followedAccounts,
  fromObservationRow,
  toObservationRow,
  toPostRow,
  toSocialMatchRow,
} from "../pipeline";
import { reconcile } from "../reconcile";
import { resolveObservations } from "../resolve";
import { collectionWindow, todayInParis } from "../schedule";
import { buildSeasonDirectories } from "../season";

import flashPost from "./fixtures/apify-flash-post.json";

// Vrai post Apify (@flashdelacourneuve, 9 nov. 2026), URLs d'images factices.
const post = flashPost as ApifyPost;

describe("planification de la collecte", () => {
  it("collecte du lundi au jeudi après une journée de compétition", () => {
    // Q - J2 du championnat : 7-8 novembre 2026.
    expect(collectionWindow("2026-11-09")).toMatchObject({
      since: "2026-11-07",
      events: [{ competition: "CM", stage: "Q - J2" }],
    });
    expect(collectionWindow("2026-11-11")?.since).toBe("2026-11-07");
    expect(collectionWindow("2026-11-12")?.since).toBe("2026-11-07");
  });

  it("ne collecte pas pendant le week-end ni les semaines sans compétition", () => {
    expect(collectionWindow("2026-11-08")).toBeNull(); // dimanche de la journée
    expect(collectionWindow("2026-11-13")).toBeNull(); // vendredi, trop tard
    expect(collectionWindow("2026-12-16")).toBeNull(); // pas de journée
  });

  it("couvre les deux jours de la Coupe du 31 oct. et 1er nov.", () => {
    const w = collectionWindow("2026-11-02")!;
    expect(w.since).toBe("2026-10-31");
    expect(w.events.map(e => e.stage).sort()).toEqual(["Q - J1", "Qualif."]);
  });

  it("donne la date du jour à Paris", () => {
    // 23h30 UTC le 9 nov. = 0h30 le 10 nov. à Paris
    expect(todayInParis(new Date("2026-11-09T23:30:00Z"))).toBe("2026-11-10");
  });
});

describe("posts Apify", () => {
  it("prend toutes les images d'un carrousel", () => {
    expect(postImageUrls(post)).toEqual([
      "https://cdn.example/flash-1.jpg",
      "https://cdn.example/flash-2.jpg",
    ]);
  });

  it("prend l'image principale d'un post simple ou d'une vidéo", () => {
    expect(
      postImageUrls({
        ...post,
        type: "Video",
        childPosts: [],
        images: [],
        displayUrl: "https://cdn.example/thumb.jpg",
      })
    ).toEqual(["https://cdn.example/thumb.jpg"]);
  });

  it("convertit un post en ligne `social_posts`", () => {
    expect(toPostRow(post, "run1")).toMatchObject({
      id: "4026657149773428454",
      run_id: "run1",
      account: "flashdelacourneuve",
      posted_at: "2026-11-09T14:35:59.000Z",
      media_type: "Sidecar",
    });
  });

  it("rattache un post en collaboration au club scrapé, pas au photographe", () => {
    // Vrai cas : post des Molosses publié en collaboration avec @zac.shots.
    const collab = {
      ...post,
      ownerUsername: "zac.shots",
      inputUrl: "https://www.instagram.com/molossesasnieres/",
    };
    expect(toPostRow(collab, null).account).toBe("molossesasnieres");
    expect(toPostRow({ ...post, inputUrl: undefined }, null).account).toBe(
      "flashdelacourneuve"
    );
  });

  it("liste les comptes suivis, sans doublon", () => {
    expect(
      followedAccounts({ a: ["@Flash", "flash"], b: ["molosses"] })
    ).toEqual(["flash", "molosses"]);
  });
});

describe("chaîne complète sur le vrai post Flash (sans base de données)", () => {
  // Ce que Claude doit lire sur ce post (légende + visuels).
  const extraction: Extraction = {
    is_results_post: true,
    competition_text: "Championnat de France Flag Football mixte",
    stage_text: null,
    match_date: null,
    confidence: 0.95,
    notes: null,
    results: [
      ["Flash A", "Cougars", 0, 43, true],
      ["Flash A", "Molosses", 0, 39, true],
      ["Flash A", "Dragons", 7, 42, true],
      ["Flash B", "Diables Rouges", 7, 48, true],
      ["Flash B", "Homies", 26, 21, true],
      ["Flash B", "Soldiers", 18, 0, true],
      // Championnat IDF U18, dans le même post : à ignorer.
      ["Flash", "Météores", 28, 34, false],
      ["Flash", "Corsaires", 21, 26, false],
      ["Flash", "Molosses", 28, 6, false],
    ].map(([team, opponent, ts, os, national], i) => ({
      team: team as string,
      opponent: opponent as string,
      team_score: ts as number,
      opponent_score: os as number,
      slide: 1,
      forfeit: false,
      competition_text: national
        ? "Championnat de France Flag Football mixte"
        : "Championnat IDF Flag Football U18",
      national_senior: national as boolean,
      _i: i,
    })),
  };

  it("de l'extraction aux scores retenus", () => {
    const row = toPostRow(post, "run1");
    const { event, observations } = toObservations(
      row.id,
      row.account,
      row.posted_at,
      extraction
    );
    expect(event).toMatchObject({ competition: "CM", stage: "Q - J2" });
    expect(observations).toHaveLength(6); // les 3 scores U18 sont écartés

    // Aller-retour par la base de données.
    const reloaded = observations.map(toObservationRow).map(fromObservationRow);
    expect(reloaded).toEqual(observations);

    const { forEvent } = buildSeasonDirectories();
    const resolved = resolveObservations(reloaded, forEvent);
    const decisions = reconcile(resolved);
    expect(decisions).toHaveLength(6);

    const rows = decisions.map(d => toSocialMatchRow(d, event!));
    const dragons = rows.find(
      r =>
        r.team_home === "Gavroches (Paris)" ||
        r.team_away === "Gavroches (Paris)"
    )!;
    expect(dragons.auto_apply).toBe(false);
    expect(rows.filter(r => r.auto_apply)).toHaveLength(5);
    expect(rows.every(r => !("review" in r))).toBe(true);
  });
});
