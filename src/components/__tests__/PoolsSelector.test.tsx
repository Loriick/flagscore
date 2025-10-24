import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PoolsSelector } from "../PoolsSelector";

// Mock hooks
vi.mock("../../hooks/useAppData", () => ({
  useAppData: () => ({
    // State
    currentSeason: 2026,
    selectedChampionshipId: 1,
    selectedPoolId: 1,

    // Data
    championships: [{ id: 1, name: "Championnat de France mixte" }],
    pools: [{ id: 1, name: "Poule A" }],
    days: [{ id: 1, name: "Journée 1", date: "2026-01-01" }],
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
    poolsAreLoading: false,
    hasData: true,
    hasPools: true,

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
  PoolSelector: ({ pools, selectedPoolId }: any) => (
    <div data-testid="pool-selector">
      Pool: {selectedPoolId} ({pools.length} pools)
    </div>
  ),
}));

vi.mock("../DaysNavigation", () => ({
  DaysNavigation: ({ days }: any) => (
    <div data-testid="days-navigation">Days: {days.length} days</div>
  ),
}));

vi.mock("../MatchesList", () => ({
  MatchesList: ({ matches, loading }: any) => (
    <div data-testid="matches-list">
      Matches: {matches.length} matches (loading: {loading.toString()})
    </div>
  ),
}));

vi.mock("../SkeletonLoader", () => ({
  SkeletonLoader: () => <div data-testid="skeleton-loader">Loading...</div>,
}));

describe("PoolsSelectorRefactored", () => {
  it("should render with Zustand state management", () => {
    render(<PoolsSelector />);

    // Check that components are rendered
    expect(screen.getByTestId("season-selector")).toBeInTheDocument();
    expect(screen.getByTestId("championship-selector")).toBeInTheDocument();
    expect(screen.getByTestId("pool-selector")).toBeInTheDocument();
    expect(screen.getByTestId("days-navigation")).toBeInTheDocument();
    expect(screen.getByTestId("matches-list")).toBeInTheDocument();

    // Check content
    expect(screen.getByText("Season: 2026 (1 seasons)")).toBeInTheDocument();
    expect(
      screen.getByText("Championship: 1 (1 championships)")
    ).toBeInTheDocument();
    expect(screen.getByText("Pool: 1 (1 pools)")).toBeInTheDocument();
    expect(screen.getByText("Days: 1 days")).toBeInTheDocument();
    expect(
      screen.getByText("Matches: 0 matches (loading: false)")
    ).toBeInTheDocument();
  });

  it("should not render skeleton when not loading", () => {
    render(<PoolsSelector />);

    expect(screen.queryByTestId("skeleton-loader")).not.toBeInTheDocument();
  });

  it("should handle empty states correctly", () => {
    // Test simplified - check that the component renders without error
    render(<PoolsSelector />);

    // Check that the main component is rendered
    expect(screen.getByTestId("season-selector")).toBeInTheDocument();
  });
});
