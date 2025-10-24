import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PoolsSelector } from "../PoolsSelector";

// Mock des hooks avec des données réalistes
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

// Mock des composants enfants
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

describe("PoolsSelector - Data Loading", () => {
  it("should load and display data correctly", async () => {
    render(<PoolsSelector />);

    // Vérifier que les composants sont rendus
    expect(screen.getByTestId("season-selector")).toBeInTheDocument();
    expect(screen.getByTestId("championship-selector")).toBeInTheDocument();
    expect(screen.getByTestId("pool-selector")).toBeInTheDocument();
    expect(screen.getByTestId("days-navigation")).toBeInTheDocument();
    expect(screen.getByTestId("matches-list")).toBeInTheDocument();

    // Vérifier le contenu avec les données mockées
    expect(screen.getByText("Season: 2026 (1 seasons)")).toBeInTheDocument();
    expect(
      screen.getByText("Championship: 1 (1 championships)")
    ).toBeInTheDocument();
    expect(screen.getByText("Pool: 1 (1 pools)")).toBeInTheDocument();
    expect(screen.getByText("Days: 1 days")).toBeInTheDocument();
    expect(
      screen.getByText("Matches: 1 matches (loading: false)")
    ).toBeInTheDocument();
  });

  it("should not show skeleton when data is loaded", () => {
    render(<PoolsSelector />);

    expect(screen.queryByTestId("skeleton-loader")).not.toBeInTheDocument();
  });
});
