import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { MatchesList } from "../MatchesList";

import { Match } from "@/src/app/types";

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

describe("MatchesList", () => {
  it("renders matches list correctly", () => {
    render(<MatchesList matches={mockMatches} loading={false} />);

    expect(screen.getByText("Équipe A")).toBeInTheDocument();
    expect(screen.getByText("Équipe B")).toBeInTheDocument();
    expect(screen.getByText("Équipe C")).toBeInTheDocument();
    expect(screen.getByText("Équipe D")).toBeInTheDocument();
  });

  it("shows loading skeleton when loading is true", () => {
    render(<MatchesList matches={[]} loading={true} />);

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("returns null when no matches and not loading", () => {
    const { container } = render(<MatchesList matches={[]} loading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders correct number of matches", () => {
    render(<MatchesList matches={mockMatches} loading={false} />);

    const matchElements = screen.getAllByText(/Équipe/);
    expect(matchElements).toHaveLength(4); // 2 matches × 2 teams each
  });

  it("applies correct styling for winning and losing teams", () => {
    render(<MatchesList matches={mockMatches} loading={false} />);

    const teamA = screen.getByText("Équipe A");
    expect(teamA).toHaveClass("text-white");

    const teamB = screen.getByText("Équipe B");
    expect(teamB).toHaveClass("text-gray-400", "text-sm");
  });

  it("formats dates correctly", () => {
    render(<MatchesList matches={mockMatches} loading={false} />);

    expect(screen.getAllByText("15 janv.")).toHaveLength(2);
  });
});
