import { describe, expect, it } from "vitest";

import { ExtractionSchema, toObservations, type Extraction } from "../extract";

// Lecture attendue du post @flashdelacourneuve (visuel « SCORE FINAL »).
const flashExtraction: Extraction = {
  is_results_post: true,
  competition_text: "Championnat de France Mixte",
  stage_text: null,
  match_date: null,
  results: [
    {
      team: "Flash A",
      opponent: "Cougars",
      team_score: 0,
      opponent_score: 43,
      slide: 1,
      forfeit: false,
    },
    {
      team: "Flash A",
      opponent: "Molosses",
      team_score: 0,
      opponent_score: 39,
      slide: 1,
      forfeit: false,
    },
    {
      team: "Flash B",
      opponent: "Homies",
      team_score: 26,
      opponent_score: 21,
      slide: 1,
      forfeit: false,
    },
  ],
  confidence: 0.92,
  notes: null,
};

describe("toObservations", () => {
  it("rattache un post sans date à la journée via le calendrier", () => {
    const { event, observations } = toObservations(
      "post123",
      "@FlashDeLaCourneuve",
      "2026-11-09T18:00:00+0000",
      flashExtraction
    );
    expect(event).toMatchObject({ competition: "CM", stage: "Q - J2" });
    expect(observations).toHaveLength(3);
    expect(observations[1]).toMatchObject({
      id: "post123#1",
      account: "flashdelacourneuve",
      team: "Flash A",
      opponent: "Molosses",
      teamScore: 0,
      opponentScore: 39,
      confidence: 0.92,
    });
  });

  it("ignore un post qui n'annonce pas de résultat", () => {
    const r = toObservations("p", "club", "2026-11-09", {
      ...flashExtraction,
      is_results_post: false,
      results: [],
    });
    expect(r.observations).toHaveLength(0);
    expect(r.skipped).toBeDefined();
  });

  it("ignore un post hors calendrier", () => {
    const r = toObservations("p", "club", "2027-01-20", flashExtraction);
    expect(r.event).toBeNull();
    expect(r.observations).toHaveLength(0);
  });

  it("borne la confiance entre 0 et 1", () => {
    const r = toObservations("p", "club", "2026-11-09", {
      ...flashExtraction,
      confidence: 3,
    });
    expect(r.observations[0].confidence).toBe(1);
  });
});

describe("ExtractionSchema", () => {
  it("valide la forme attendue", () => {
    expect(ExtractionSchema.safeParse(flashExtraction).success).toBe(true);
    expect(
      ExtractionSchema.safeParse({
        ...flashExtraction,
        results: [{ team: "x" }],
      }).success
    ).toBe(false);
  });
});
