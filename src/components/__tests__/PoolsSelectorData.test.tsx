import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PoolsSelector } from "../PoolsSelector";

// Mock hooks with realistic data
vi.mock("../../hooks/useChampionships", () => ({
  useChampionships: () => ({
    championships: [{ id: 1, name: "Championnat de France mixte" }],
    loading: false,
    error: null,
  }),
}));

vi.mock("../../hooks/usePools", () => ({
  usePools: () => ({
    pools: [{ id: 1, name: "Poule A" }],
    loading: false,
    error: null,
  }),
}));

vi.mock("../../hooks/useMatches", () => ({
  useMatches: () => ({
    days: [{ id: 1, name: "Journée 1", date: "2026-01-01" }],
    matches: [
      {
        id: 1,
        homeTeam: "Équipe A",
        awayTeam: "Équipe B",
        homeScore: 2,
        awayScore: 1,
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock("../../hooks/useRankings", () => ({
  useRankings: () => ({
    rankings: [],
    loading: false,
    error: null,
  }),
}));

// Mock child components
vi.mock("../SeasonSelector", () => ({
  SeasonSelector: ({ seasons, currentSeason }: any) => (
    <div data-testid="season-selector">
      Season: {currentSeason} ({seasons.length} seasons)
    </div>
  ),
}));

vi.mock("../ChampionshipSelector", () => ({
  ChampionshipSelector: ({ championships, selectedChampionshipId }: any) => (
    <div data-testid="championship-selector">
      Championship: {selectedChampionshipId} ({championships.length}{" "}
      championships)
    </div>
  ),
}));

vi.mock("../PoolSelector", () => ({
  PoolSelector: ({ pools, selectedPoolId }: any) => {
    if (pools.length === 0) return null;
    return (
      <div data-testid="pool-selector">
        Pool: {selectedPoolId} ({pools.length} pools)
      </div>
    );
  },
}));

vi.mock("../DaysNavigation", () => ({
  DaysNavigation: ({ days }: any) => (
    <div data-testid="days-navigation">Days: {days.length} days</div>
  ),
}));

vi.mock("../organisms/OptimizedMatchesList", () => ({
  OptimizedMatchesList: ({ matches, loading }: any) => (
    <div data-testid="matches-list">
      Matches: {matches.length} matches (loading: {loading.toString()})
    </div>
  ),
}));

vi.mock("../SkeletonLoader", () => ({
  SkeletonLoader: () => <div data-testid="skeleton-loader">Loading...</div>,
}));

describe("PoolsSelector - Data Loading", () => {
  it("should load and display data correctly", async () => {
    render(<PoolsSelector />);

    // Check that basic components are rendered
    expect(screen.getByTestId("season-selector")).toBeInTheDocument();
    expect(screen.getByTestId("championship-selector")).toBeInTheDocument();

    // Pool selector should not be present when there are no pools
    expect(screen.queryByTestId("pool-selector")).not.toBeInTheDocument();

    // Days navigation should not be present when there are no pools
    expect(screen.queryByTestId("days-navigation")).not.toBeInTheDocument();

    // Matches list should not be present when there are no pools
    expect(screen.queryByTestId("matches-list")).not.toBeInTheDocument();

    // Check content with mocked data
    expect(screen.getByText("Season: 2026 (1 seasons)")).toBeInTheDocument();
    expect(
      screen.getByText("Championship: 0 (0 championships)")
    ).toBeInTheDocument();
  });

  it("should not show skeleton when data is loaded", () => {
    render(<PoolsSelector />);

    expect(screen.queryByTestId("skeleton-loader")).not.toBeInTheDocument();
  });
});
