import { describe, expect, it } from "vitest";

import type { CompetitionEvent } from "../calendar";
import { POOLS_2026_2027 } from "../data/pools-2026-2027";
import { reconcile } from "../reconcile";
import { resolveObservations, type Observation } from "../resolve";
import { buildSeasonDirectory, listClubs } from "../season";

/*
 * Les deux vrais posts du week-end du 7-8 novembre 2026 (Q - J2), rapprochés
 * avec les vraies poules publiées par @fffa_flag.
 */

const directory = buildSeasonDirectory();

const Q_J2: CompetitionEvent = {
  competition: "CM",
  stage: "Q - J2",
  start: "2026-11-07",
  end: "2026-11-08",
};

let n = 0;
const obs = (
  postId: string,
  account: string,
  team: string,
  opponent: string,
  teamScore: number,
  opponentScore: number
): Observation => ({
  id: `${postId}#${n++}`,
  postId,
  account,
  event: Q_J2,
  team,
  opponent,
  teamScore,
  opponentScore,
  confidence: 0.95,
});

const flashPost = [
  obs("flash", "flashdelacourneuve", "Flash A", "Cougars", 0, 43),
  obs("flash", "flashdelacourneuve", "Flash A", "Molosses", 0, 39),
  obs("flash", "flashdelacourneuve", "Flash A", "Dragons", 7, 42),
  obs("flash", "flashdelacourneuve", "Flash B", "Diables Rouges", 7, 48),
  obs("flash", "flashdelacourneuve", "Flash B", "Homies", 26, 21),
  obs("flash", "flashdelacourneuve", "Flash B", "Soldiers", 18, 0),
];

const molossesPost = [
  obs("mol", "molossesasnieres", "Red", "Nighthawks", 18, 0),
  obs("mol", "molossesasnieres", "Red", "Asgards", 18, 0),
  obs("mol", "molossesasnieres", "Red", "Lycans", 40, 25),
];

const pair = (r: { home?: string; away?: string }) => [r.home, r.away].sort();

describe("données de la saison 2026-2027", () => {
  it("contient toutes les équipes des deux conférences", () => {
    const total = POOLS_2026_2027.reduce((s, p) => s + p.teams.length, 0);
    expect(directory.teams).toHaveLength(total);
    expect(POOLS_2026_2027.filter(p => p.conference === "Nord")).toHaveLength(
      17
    );
    expect(POOLS_2026_2027.filter(p => p.conference === "Sud")).toHaveLength(
      10
    );
  });

  it("distingue les homonymes par la ville", () => {
    expect(directory.candidates("Phenix").sort()).toEqual([
      "Phenix (Béthune)",
      "Phenix (Limoges)",
    ]);
  });

  it("regroupe les équipes par club", () => {
    const molosses = listClubs().find(c => c.club === "Molosses (Asnières)");
    expect(molosses?.teams).toHaveLength(3);
  });
});

describe("posts réels avec les vraies poules", () => {
  const resolved = resolveObservations(
    [...flashPost, ...molossesPost],
    directory
  );
  const find = (opponent: string) =>
    resolved.find(r => r.observation.opponent === opponent)!;

  it("« Red » des Molosses = Molosses B (seule équipe des Molosses dans la poule)", () => {
    expect(pair(find("Nighthawks"))).toEqual([
      "Molosses B (Asnières)",
      "Nighthawks (Sartrouville)",
    ]);
    expect(find("Lycans").status).toBe("resolved");
  });

  it("le « Molosses » de Flash A = Molosses C (même poule IDF Nord)", () => {
    expect(pair(find("Molosses"))).toEqual([
      "Flash A (La Courneuve)",
      "Molosses C (Asnières)",
    ]);
  });

  it("« Cougars », « Homies », « Diables Rouges » : la poule choisit la bonne équipe", () => {
    expect(pair(find("Cougars"))).toContain("Cougars C (Saint-Ouen-l'Aumône)");
    expect(pair(find("Homies"))).toContain("Homies A (Rosny-sous-Bois)");
    expect(pair(find("Diables Rouges"))).toContain(
      "Diables Rouges A (Villepinte)"
    );
    expect(pair(find("Soldiers"))).toContain("Marne Soldiers (Meaux)");
  });

  it("« Dragons » (absent des poules) est déduit par élimination : Gavroches", () => {
    const dragons = find("Dragons");
    expect(dragons.status).toBe("resolved");
    expect(dragons.inferred).toBe(true);
    expect(pair(dragons)).toEqual([
      "Flash A (La Courneuve)",
      "Gavroches (Paris)",
    ]);
  });

  it("applique les 8 scores reconnus et met « Dragons » en validation", () => {
    const decisions = reconcile(resolved);
    expect(decisions).toHaveLength(9);
    const pending = decisions.filter(d => !d.autoApply);
    expect(pending).toHaveLength(1);
    expect(pending[0].reason).toMatch(/Dragons/);
  });

  it("refuse un adversaire hors de la poule", () => {
    const [r] = resolveObservations(
      [obs("x", "flashdelacourneuve", "Flash A", "Asgards", 10, 0)],
      directory
    );
    expect(r.status).toBe("unmatched");
  });
});
