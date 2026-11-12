import { describe, expect, it } from "vitest";

import type { CompetitionEvent } from "../calendar";
import { CDF_POOLS_2026_2027 } from "../data/cdf-2026-2027";
import { CLUB_INSTAGRAM, POOLS_2026_2027 } from "../data/pools-2026-2027";
import { reconcile } from "../reconcile";
import { resolveObservations, type Observation } from "../resolve";
import {
  buildSeasonDirectories,
  buildSeasonDirectory,
  listClubs,
} from "../season";

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

  it("regroupe les équipes par club, toutes compétitions confondues", () => {
    const molosses = listClubs().find(c => c.club === "Molosses (Asnières)");
    // CM : A, B, C ; Coupe masc. : A, B, C ; Coupe fém. : A, B
    expect(molosses?.teams).toHaveLength(8);
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

describe("Coupe de France (masculins et féminines)", () => {
  const { forEvent, byCompetition } = buildSeasonDirectories();

  const CDF_Q1: CompetitionEvent = {
    competition: "CDF",
    stage: "Q - J1",
    start: "2026-11-01",
    end: "2026-11-01",
  };
  const cdfObs = (
    account: string,
    team: string,
    opponent: string
  ): Observation => ({
    ...obs("cdf", account, team, opponent, 20, 6),
    event: CDF_Q1,
  });

  it("contient les poules masculines et féminines", () => {
    expect(
      CDF_POOLS_2026_2027.filter(p => p.category === "Masculin")
    ).toHaveLength(21);
    expect(
      CDF_POOLS_2026_2027.filter(p => p.category === "Féminin")
    ).toHaveLength(6);
    expect(byCompetition.CDF.candidates("Molosses A").sort()).toEqual([
      "Molosses A (Asnières) · Fém.",
      "Molosses A (Asnières) · Masc.",
    ]);
  });

  it("utilise les poules de la Coupe pour un post de Coupe", () => {
    // En Coupe masc., Flash A est en poule 6 avec Molosses C (comme en CM),
    // mais Flash B est en poule 10 avec Cougars A et Diables Rouges A.
    const [r] = resolveObservations(
      [cdfObs("flashdelacourneuve", "Flash B", "Cougars")],
      forEvent
    );
    expect(pair(r)).toEqual([
      "Cougars A (Saint-Ouen-l'Aumône) · Masc.",
      "Flash B (La Courneuve) · Masc.",
    ]);
  });

  it("la poule distingue masculin et féminin", () => {
    // Seule l'équipe féminine de Flash affronte Fenris.
    const [r] = resolveObservations(
      [cdfObs("flashdelacourneuve", "Flash", "Fenris")],
      forEvent
    );
    expect(pair(r)).toEqual([
      "Fenris (Dijon) · Fém.",
      "Flash (La Courneuve) · Fém.",
    ]);
  });

  it("reste ambigu si masculin et féminin sont tous deux possibles", () => {
    // Flash A masc. (poule 6) et Flash fém. (poule 2) affrontent tous deux
    // une équipe des Molosses : sans autre indice, on ne tranche pas.
    const [r] = resolveObservations(
      [cdfObs("flashdelacourneuve", "Flash", "Molosses")],
      forEvent
    );
    expect(r.status).toBe("ambiguous");
  });

  it("un même post de championnat n'utilise pas les poules de la Coupe", () => {
    const resolved = resolveObservations(
      [obs("flash", "flashdelacourneuve", "Flash B", "Homies", 26, 21)],
      forEvent
    );
    expect(pair(resolved[0])).toEqual([
      "Flash B (La Courneuve)",
      "Homies A (Rosny-sous-Bois)",
    ]);
  });
});

describe("cas réels du 12 novembre (première exécution en production)", () => {
  // Post @molossesasnieres « Molosses Black invaincus pour cette deuxième
  // journée » : trois matchs, adversaires écrits avec leur département.
  const black = [
    obs(
      "black",
      "molossesasnieres",
      "Molosses Black",
      "Juggernautes Paris",
      34,
      7
    ),
    obs(
      "black",
      "molossesasnieres",
      "Molosses Black",
      "Cougars Football 95",
      65,
      12
    ),
    obs(
      "black",
      "molossesasnieres",
      "Molosses Black",
      "Diables Rouges 93",
      42,
      14
    ),
  ];

  it("ignore les numéros de département dans les noms", () => {
    expect(directory.candidates("Cougars Football 95").sort()).toEqual([
      "Cougars A (Saint-Ouen-l'Aumône)",
      "Cougars B (Saint-Ouen-l'Aumône)",
      "Cougars C (Saint-Ouen-l'Aumône)",
    ]);
  });

  it("un même nom dans un même post désigne la même équipe (Black = Molosses A)", () => {
    const resolved = resolveObservations(black, directory);
    expect(resolved.every(r => r.status === "resolved")).toBe(true);
    for (const r of resolved) {
      expect([r.home, r.away]).toContain("Molosses A (Asnières)");
    }
    expect(pair(resolved[1])).toContain("Cougars B (Saint-Ouen-l'Aumône)");
    expect(pair(resolved[2])).toContain("Diables Rouges B (Villepinte)");
  });
});

describe("comptes Instagram des clubs", () => {
  it("chaque compte est rattaché à un club existant des poules", () => {
    const clubs = new Set(listClubs().map(c => c.club));
    const unknown = Object.keys(CLUB_INSTAGRAM).filter(c => !clubs.has(c));
    expect(unknown).toEqual([]);
  });

  it("aucun compte n'est suivi deux fois", () => {
    const handles = Object.values(CLUB_INSTAGRAM).flat();
    expect(new Set(handles).size).toBe(handles.length);
  });
});
