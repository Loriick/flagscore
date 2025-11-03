import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

import { PoolsSelector } from "../PoolsSelector";

vi.mock("../../hooks/useAppDataSupabase", () => ({
  useAppDataSupabase: () => ({
    currentSeason: 2026,
    selectedChampionshipId: 1,
    selectedPoolId: 10,
    selectedDayId: 0,
    championships: [{ id: 1, label: "Champ 1", season: 2026, male: true }],
    pools: [{ id: 10, label: "Poule A", championship_id: 1, phase_id: 1 }],
    days: [
      {
        id: 100,
        label: "J1",
        pool_id: 10,
        championship_id: 1,
        phase_id: 1,
        date: "2026-01-01",
        number: 1,
      },
    ],
    matches: [],
    rankings: [],
    loading: {
      championships: false,
      pools: false,
      days: false,
      matches: false,
      rankings: false,
    },
    initialLoading: false,
    poolChangeLoading: false,
    hasData: true,
    hasPools: true,
    errors: {
      championships: null,
      pools: null,
      days: null,
      matches: null,
      rankings: null,
    },
    handleSeasonChange: vi.fn(),
    handleChampionshipChange: vi.fn(),
    handlePoolChange: vi.fn(),
    handleDayChange: vi.fn(),
    setSeason: vi.fn(),
    setChampionship: vi.fn(),
    setPool: vi.fn(),
    setDay: vi.fn(),
    resetSelections: vi.fn(),
  }),
}));

describe("PoolsSelector", () => {
  it("n'affiche pas de bouton Partager", () => {
    render(<PoolsSelector />);
    const shareButton = screen.queryByRole("button", { name: /partager/i });
    expect(shareButton).toBeNull();
  });
});
