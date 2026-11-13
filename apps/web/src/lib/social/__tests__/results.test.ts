import { describe, expect, it } from "vitest";

import {
  displayTeamName,
  publishedRows,
  socialDays,
  socialMatches,
  socialPools,
  socialRankings,
  type SocialMatchRow,
} from "../results";

const row = (
  event_key: string,
  team_home: string,
  team_away: string,
  score_home: number,
  score_away: number,
  accounts = ["club"]
): SocialMatchRow => ({
  match_key: `${event_key}|${team_home}|${team_away}`,
  event_key,
  team_home,
  team_away,
  score_home,
  score_away,
  status: "single_source",
  accounts,
});

// Poule BRE du championnat : Ankou, Mariners, Korrigans, Licornes.
const J1 = "CM|Q - J1|2026-10-17";
const rows = [
  row(J1, "Ankou (Rennes)", "Mariners (Vannes)", 30, 12, ["a", "b"]),
  row(J1, "Korrigans (Ploërmel)", "Licornes (Saint-Brieuc)", 20, 20),
  row(J1, "Ankou (Rennes)", "Korrigans (Ploërmel)", 6, 18),
  // Autre poule : ne doit pas apparaître.
  row(J1, "Esox (Basse-Goulaine)", "Yankees (Angers)", 7, 0),
];

describe("résultats affichés à partir d'Instagram", () => {
  const bre = socialPools(1)[0];

  it("liste les poules et les journées de qualification", () => {
    expect(bre).toMatchObject({ id: 101, label: "Nord - BRE" });
    expect(socialPools(2)[0].label).toBe("Nord - Poule 1");
    expect(socialDays(bre.id).map(d => [d.id, d.label])).toEqual([
      [20261017, "Journée 1"],
      [20261107, "Journée 2"],
      [20261205, "Journée 3"],
    ]);
  });

  it("garde les matchs de la poule et de la journée, avec leurs sources", () => {
    const matches = socialMatches(rows, bre.id, 20261017);
    expect(matches).toHaveLength(3);
    expect(matches[0]).toMatchObject({
      team_a: { name: "Ankou", score: 30 },
      team_b: { name: "Mariners", score: 12 },
      sources: ["a", "b"],
    });
    expect(socialMatches(rows, bre.id, 20261107)).toEqual([]);
  });

  it("calcule le classement : victoire 3, nul 1, défaite 0", () => {
    const table = socialRankings(rows, bre.id);
    expect(
      table.map(r => [r.position, r.club.label, r.points, r.j, r.points_diff])
    ).toEqual([
      [1, "Korrigans", 4, 2, 12],
      [2, "Ankou", 3, 2, 6],
      [3, "Licornes", 1, 1, 0],
      [4, "Mariners", 0, 1, -18],
    ]);
  });

  it("indique les places qualificatives pour la D1 et la D2", () => {
    const table = socialRankings(rows, bre.id);
    expect(table.map(r => r.qualification)).toEqual([
      "D1",
      "D2",
      undefined,
      undefined,
    ]);
    // Pas de qualification en Coupe de France.
    const cdf = socialRankings(rows, socialPools(2)[0].id);
    expect(cdf.every(r => r.qualification === undefined)).toBe(true);
  });

  it("raccourcit les noms de référence", () => {
    expect(displayTeamName("Molosses B (Asnières) · Fém.")).toBe("Molosses B");
    expect(displayTeamName("Phenix (Béthune)")).toBe("Phenix");
  });

  it("applique les décisions de /admin/scores", () => {
    const base = row(J1, "Ankou (Rennes)", "Mariners (Vannes)", 30, 12);
    const out = publishedRows([
      { ...base, auto_apply: true },
      { ...base, match_key: "rejeté", auto_apply: true, review: "rejected" },
      { ...base, match_key: "à vérifier", auto_apply: false },
      {
        ...base,
        match_key: "corrigé",
        auto_apply: false,
        review: "approved",
        review_score_home: 31,
        review_score_away: 12,
      },
    ]);
    expect(out.map(r => [r.match_key, r.score_home])).toEqual([
      [base.match_key, 30],
      ["corrigé", 31],
    ]);
  });
});
