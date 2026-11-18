import { describe, expect, it } from "vitest";

import { memoryDb, type Row } from "../../__tests__/memory-db";
import { manualMatchRow, publishedRows, type SocialMatchRow } from "../results";
import { addManualMatch, reviewMatch } from "../review";

const manual = manualMatchRow({
  poolId: 101,
  dayId: 20261017,
  teamA: "Mariners (Vannes)",
  teamB: "Ankou (Rennes)",
  scoreA: 12,
  scoreB: 30,
})!;

const instagram: Row = {
  ...manual,
  score_home: 28,
  score_away: 12,
  status: "single_source",
  auto_apply: false,
  source: "instagram",
  review: null,
  review_score_home: null,
  review_score_away: null,
  reason: "Une seule source",
  accounts: ["ankou"],
  observation_ids: ["post#0"],
};

const onSite = (tables: Record<string, Row[]>) =>
  publishedRows(tables.social_matches as unknown as SocialMatchRow[]);

describe("décisions de la page Scores", () => {
  it("valide un score Instagram avec correction, puis annule la décision", async () => {
    const { db, tables } = memoryDb({ social_matches: [{ ...instagram }] });
    expect(
      await reviewMatch(db, manual.match_key, {
        type: "approve",
        scoreHome: 30,
        scoreAway: 12,
      })
    ).toEqual({ ok: true });
    expect(onSite(tables)).toEqual([
      expect.objectContaining({ score_home: 30, score_away: 12 }),
    ]);

    await reviewMatch(db, manual.match_key, { type: "reset" });
    expect(tables.social_matches).toHaveLength(1);
    expect(onSite(tables)).toEqual([]);
  });

  it("supprime un match saisi à la main quand on annule la décision", async () => {
    const { db, tables } = memoryDb({ social_matches: [] });
    expect(await addManualMatch(db, manual)).toEqual({
      ok: true,
      updated: false,
    });
    expect(onSite(tables)).toHaveLength(1);
    await reviewMatch(db, manual.match_key, { type: "reset" });
    expect(tables.social_matches).toEqual([]);
  });

  it("répond 404 pour un match inconnu", async () => {
    const { db } = memoryDb({ social_matches: [] });
    expect(await reviewMatch(db, "inconnu", { type: "reject" })).toMatchObject({
      ok: false,
      status: 404,
    });
  });

  it("refuse toute décision sur le score d'une feuille signée", async () => {
    const signed: Row = {
      ...instagram,
      source: "delegate",
      review: "approved",
      review_score_home: 31,
      review_score_away: 12,
      reason: "Feuille signée par les deux équipes",
    };
    const { db, tables } = memoryDb({ social_matches: [{ ...signed }] });
    const actions = [
      { type: "approve", scoreHome: 0, scoreAway: 0 },
      { type: "reject" },
      { type: "reset" },
    ] as const;
    for (const action of actions) {
      const outcome = await reviewMatch(db, manual.match_key, action);
      expect(outcome).toMatchObject({ ok: false, status: 409 });
      expect(!outcome.ok && outcome.message).toContain("Rouvrir");
    }
    expect(await addManualMatch(db, manual)).toMatchObject({
      ok: false,
      status: 409,
    });
    expect(tables.social_matches).toEqual([signed]);
  });
});
