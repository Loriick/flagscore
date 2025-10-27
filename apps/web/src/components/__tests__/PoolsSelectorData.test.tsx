import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PoolsSelector } from "../PoolsSelector";

// Mock hooks
vi.mock("../../hooks/useAppDataSupabase", () => ({
  useAppDataSupabase: () => ({
    // State
    currentSeason: 2026,
    selectedChampionshipId: 1,
    selectedPoolId: 1,
    selectedDayId: 1,

    // Data
    championships: [
      {
        id: 1,
        label: "Championnat de France mixte",
        season: 2026,
        male: false,
      },
    ],
    pools: [], // Pas de pools pour ce test
    days: [],
    matches: [],

    // Loading states
    loading: {
      championships: false,
      pools: false,
      days: false,
      matches: false,
      rankings: false,
    },
    initialLoading: false,
    poolChangeLoading: false,
    hasPools: false,

    // Errors
    errors: {
      championships: null,
      pools: null,
      days: null,
      matches: null,
      rankings: null,
    },

    // Handlers
    handleSeasonChange: vi.fn(),
    handleChampionshipChange: vi.fn(),
    handlePoolChange: vi.fn(),
    handleDayChange: vi.fn(),
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
      screen.getByText("Championship: 1 (1 championships)")
    ).toBeInTheDocument();
  });

  it("should not show skeleton when data is loaded", () => {
    render(<PoolsSelector />);

    expect(screen.queryByTestId("skeleton-loader")).not.toBeInTheDocument();
  });
});
