import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { memoryDb, type Row } from "../../__tests__/memory-db";

import {
  poolMatch,
  publishedRows,
  type SocialMatchRow,
  socialPools,
  socialPoolTeams,
} from "../../social/results";
import {
  loadSheet,
  REQUIRED_SIGNATURES,
  reopenSheet,
  savePlateauRow,
  saveResult,
  saveSignature,
  SheetError,
} from "..";

const pool = socialPools(1).find(p =>
  socialPoolTeams(p.id).some(t => t.ref === "Ankou (Rennes)")
)!;
const EVENT = "CM|Q - J1|2026-10-17";
const match = poolMatch({
  poolId: pool.id,
  eventKey: EVENT,
  teamA: "Mariners (Vannes)",
  teamB: "Ankou (Rennes)",
})!;

function setup(socialMatches: Row[] = []) {
  return memoryDb({
    plateaux: [
      {
        id: "p1",
        event_key: EVENT,
        pool_id: pool.id,
        date: "2026-10-17",
        venue: "Rennes",
        host_club: null,
      },
    ],
    match_sheets: [
      {
        id: "s1",
        plateau_id: "p1",
        match_key: match.row.match_key,
        team_home: match.row.team_home,
        team_away: match.row.team_away,
        score_home: null,
        score_away: null,
        forfeit: null,
        status: "draft",
        version: 1,
        signed_at: null,
      },
    ],
    sheet_signatures: [],
    injuries: [],
    audit_log: [],
    social_matches: socialMatches,
  });
}

const signature = (side: "home" | "away", role: "coach" | "captain") => ({
  side,
  role,
  signerName: `${side} ${role}`,
  path: "M1 1L5 5",
});

async function signAll(db: SupabaseClient) {
  let last = false;
  for (const [side, role] of REQUIRED_SIGNATURES) {
    last = await saveSignature(
      db,
      (await loadSheet(db, "s1"))!,
      signature(side, role),
      "u1"
    );
  }
  return last;
}

const onSite = (tables: Record<string, Row[]>) =>
  publishedRows(tables.social_matches as unknown as SocialMatchRow[]);

describe("feuilles en base", () => {
  it("publie le score à la quatrième signature", async () => {
    const { db, tables } = setup();
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 30, away: 12 },
      "u1"
    );
    expect(await signAll(db)).toBe(true);

    expect(tables.match_sheets[0]).toMatchObject({
      status: "signed",
      score_home: 30,
    });
    expect(tables.social_matches).toEqual([
      expect.objectContaining({
        match_key: match.row.match_key,
        source: "delegate",
        review: "approved",
        review_score_home: 30,
        review_score_away: 12,
      }),
    ]);
    expect(tables.audit_log.map(a => a.action)).toContain("sheet.signed");
  });

  it("garde les sources Instagram d'un match déjà relevé", async () => {
    const { db, tables } = setup([
      {
        ...match.row,
        score_home: 28,
        score_away: 12,
        status: "single_source",
        auto_apply: true,
        review: null,
        accounts: ["ankou"],
        observation_ids: ["post#0"],
      },
    ]);
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 30, away: 12 },
      "u1"
    );
    await signAll(db);
    expect(tables.social_matches).toHaveLength(1);
    expect(tables.social_matches[0]).toMatchObject({
      accounts: ["ankou"],
      observation_ids: ["post#0"],
      score_home: 28,
      review: "approved",
      review_score_home: 30,
      source: "delegate",
    });
  });

  it("efface les signatures quand le score change, et refuse d'écrire sur une version dépassée", async () => {
    const { db, tables } = setup();
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 1, away: 0 },
      "u1"
    );
    const stale = (await loadSheet(db, "s1"))!;
    await saveSignature(db, stale, signature("home", "coach"), "u1");
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 2, away: 0 },
      "u1"
    );

    expect((await loadSheet(db, "s1"))!.sheet.signatures).toEqual([]);
    await expect(
      saveResult(db, stale, { kind: "score", home: 3, away: 0 }, "u1")
    ).rejects.toBeInstanceOf(SheetError);
    expect(tables.match_sheets[0]).toMatchObject({ score_home: 2 });
  });

  it("laisse la feuille en brouillon, avec un message clair, quand la publication échoue", async () => {
    const { db, tables, hooks } = setup();
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 30, away: 12 },
      "u1"
    );
    hooks.failingWrites.add("social_matches");
    const error = await signAll(db).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(SheetError);
    expect((error as Error).message).toBe(
      "Le score n'a pas pu être publié. La feuille n'est pas signée : refais la dernière signature."
    );
    expect(tables.match_sheets[0]).toMatchObject({
      status: "draft",
      signed_at: null,
    });

    hooks.failingWrites.clear();
    const [side, role] = REQUIRED_SIGNATURES[REQUIRED_SIGNATURES.length - 1];
    expect(
      await saveSignature(
        db,
        (await loadSheet(db, "s1"))!,
        signature(side, role),
        "u1"
      )
    ).toBe(true);
    expect(onSite(tables)).toEqual([
      expect.objectContaining({ score_home: 30, score_away: 12 }),
    ]);
  });

  it("ne dit pas « publié » quand le score a changé pendant la dernière signature", async () => {
    const { db, tables, hooks } = setup();
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 30, away: 12 },
      "u1"
    );
    hooks.beforeUpdate = (table, values) => {
      if (table !== "match_sheets" || values.status !== "signed") return;
      Object.assign(tables.match_sheets[0], {
        score_home: 31,
        version: (tables.match_sheets[0].version as number) + 1,
      });
    };
    expect(await signAll(db)).toBe(false);
    expect(tables.match_sheets[0]).toMatchObject({ status: "draft" });
    expect(onSite(tables)).toEqual([]);
  });

  it("rouvre une feuille signée et retire le score du site", async () => {
    const { db, tables } = setup();
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "forfeit", side: "away" },
      "u1"
    );
    await signAll(db);
    expect(tables.social_matches[0]).toMatchObject({
      forfeit: "away",
      review: "approved",
    });

    await reopenSheet(db, (await loadSheet(db, "s1"))!, "admin1");
    const reopened = (await loadSheet(db, "s1"))!;
    expect(reopened.sheet).toMatchObject({
      status: "draft",
      signatures: [],
      result: { kind: "forfeit", side: "away" },
    });
    expect(onSite(tables)).toEqual([]);
  });

  it("cache le score Instagram d'une feuille rouverte jusqu'à la nouvelle signature", async () => {
    const { db, tables } = setup([
      {
        ...match.row,
        score_home: 28,
        score_away: 12,
        status: "single_source",
        auto_apply: true,
        review: null,
        accounts: ["ankou"],
        observation_ids: ["post#0"],
      },
    ]);
    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 30, away: 12 },
      "u1"
    );
    await signAll(db);
    await reopenSheet(db, (await loadSheet(db, "s1"))!, "admin1");
    expect(onSite(tables)).toEqual([]);

    await saveResult(
      db,
      (await loadSheet(db, "s1"))!,
      { kind: "score", home: 31, away: 12 },
      "u1"
    );
    await signAll(db);
    expect(onSite(tables)).toEqual([
      expect.objectContaining({ score_home: 31, score_away: 12 }),
    ]);
  });

  it("refuse de changer la poule ou la journée d'un plateau qui a des feuilles", async () => {
    const { db, tables } = setup();
    const plateau = { ...tables.plateaux[0] } as {
      pool_id: number;
      event_key: string;
      date: string;
      venue: string;
      host_club: string | null;
    };
    const other = socialPools(1).find(p => p.id !== pool.id)!;

    await expect(
      savePlateauRow(db, "p1", { ...plateau, pool_id: other.id })
    ).rejects.toBeInstanceOf(SheetError);
    await expect(
      savePlateauRow(db, "p1", {
        ...plateau,
        event_key: "CM|Q - J2|2026-11-07",
      })
    ).rejects.toBeInstanceOf(SheetError);
    expect(tables.plateaux[0]).toMatchObject({
      pool_id: pool.id,
      event_key: EVENT,
    });

    expect(
      await savePlateauRow(db, "p1", { ...plateau, venue: "Vannes" })
    ).toBe("p1");
    expect(tables.plateaux[0]).toMatchObject({ venue: "Vannes" });
  });
});
