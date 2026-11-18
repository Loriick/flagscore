import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MatchCard } from "../MatchCard";

import type { Match } from "@flagscore/core/types";

const base: Match = {
  id: 1,
  championship_id: 1,
  phase_id: 1,
  pool_id: 101,
  day_id: 20261017,
  date: "2026-10-17",
  sheet: null,
  team_a: { name: "Ankou", score: 30, general_forfeit: false },
  team_b: { name: "Mariners", score: 12, general_forfeit: false },
};

describe("MatchCard", () => {
  it("mentionne une feuille de match signée", () => {
    render(<MatchCard match={{ ...base, signed: true, sources: [] }} />);
    expect(
      screen.getByText("Feuille de match signée par les deux équipes")
    ).toBeInTheDocument();
  });

  it("affiche un forfait sans score", () => {
    render(
      <MatchCard
        match={{
          ...base,
          signed: true,
          team_a: { name: "Ankou", score: null, general_forfeit: false },
          team_b: { name: "Mariners", score: null, general_forfeit: true },
        }}
      />
    );
    expect(screen.getByText("Forfait")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Ankou contre Mariners, forfait de Mariners")
    ).toBeInTheDocument();
  });
});
