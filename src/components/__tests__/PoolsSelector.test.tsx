import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { PoolsSelector } from "../PoolsSelector";

import { Day, Match, Pool } from "@/src/app/types";

vi.mock("../../hooks/useChampionships", () => ({
  useChampionships: vi.fn(),
}));

vi.mock("../../hooks/usePools", () => ({
  usePools: vi.fn(),
}));

vi.mock("../../hooks/useMatches", () => ({
  useMatches: vi.fn(),
}));

vi.mock("../../hooks/usePrefetch", () => ({
  usePrefetch: vi.fn(),
}));

const mockUseChampionships = vi.mocked(
  await import("../../hooks/useChampionships")
).useChampionships;
const mockUsePools = vi.mocked(await import("../../hooks/usePools")).usePools;
const mockUseMatches = vi.mocked(
  await import("../../hooks/useMatches")
).useMatches;
const mockUsePrefetch = vi.mocked(
  await import("../../hooks/usePrefetch")
).usePrefetch;

describe("PoolsSelector Integration", () => {
  const mockChampionships = [
    { id: 1, label: "Championnat de France mixte", season: 2026, male: false },
    { id: 2, label: "Coupe de France", season: 2026, male: false },
  ];

  const mockPools: Pool[] = [
    { id: 1, label: "Poule A", championship_id: 1, phase_id: 1 },
    { id: 2, label: "Poule B", championship_id: 1, phase_id: 1 },
  ];

  const mockDays: Day[] = [
    {
      id: 1,
      label: "Journée 1",
      championship_id: 1,
      phase_id: 1,
      pool_id: 1,
      date: "2024-01-15T10:00:00Z",
      number: 1,
    },
    {
      id: 2,
      label: "Journée 2",
      championship_id: 1,
      phase_id: 1,
      pool_id: 1,
      date: "2024-01-15T14:00:00Z",
      number: 2,
    },
  ];

  const mockMatches: Match[] = [
    {
      id: 1,
      championship_id: 1,
      phase_id: 1,
      pool_id: 1,
      day_id: 1,
      sheet: "1",
      team_a: { name: "Équipe A", score: 21, general_forfeit: false },
      team_b: { name: "Équipe B", score: 14, general_forfeit: false },
      date: "2024-01-15T10:00:00Z",
    },
    {
      id: 2,
      championship_id: 1,
      phase_id: 1,
      pool_id: 1,
      day_id: 1,
      sheet: "2",
      team_a: { name: "Équipe C", score: 7, general_forfeit: false },
      team_b: { name: "Équipe D", score: 28, general_forfeit: false },
      date: "2024-01-15T14:00:00Z",
    },
  ];

  beforeEach(() => {
    mockUseChampionships.mockReturnValue({
      championships: mockChampionships,
      loading: false,
      error: null,
    });

    mockUsePools.mockReturnValue({
      pools: mockPools,
      loading: false,
      error: null,
    });

    mockUseMatches.mockReturnValue({
      days: mockDays,
      matches: mockMatches,
      loading: false,
      error: null,
      cached: false,
    });

    mockUsePrefetch.mockReturnValue({
      prefetchRankings: vi.fn(),
      prefetchPools: vi.fn(),
      prefetchMatches: vi.fn(),
    });
  });

  it("renders complete component with all selectors", () => {
    render(<PoolsSelector />);

    expect(screen.getByText("Saison")).toBeInTheDocument();
    expect(screen.getByText("Compétition")).toBeInTheDocument();
    expect(screen.getByText("Poule")).toBeInTheDocument();
  });

  it("displays matches when data is loaded", () => {
    render(<PoolsSelector />);

    expect(screen.getByText("Équipe A")).toBeInTheDocument();
    expect(screen.getByText("Équipe B")).toBeInTheDocument();
    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
  });

  it("shows no pools message when no pools available", () => {
    mockUsePools.mockReturnValue({
      pools: [],
      loading: false,
      error: null,
    });

    render(<PoolsSelector />);

    expect(
      screen.getByText("Aucune poule trouvée pour cette compétition")
    ).toBeInTheDocument();
  });

  it("renders days navigation when days are available", () => {
    render(<PoolsSelector />);

    expect(screen.getByText("Journée 1")).toBeInTheDocument();
    expect(screen.getByText("Journée 2")).toBeInTheDocument();
  });
});
