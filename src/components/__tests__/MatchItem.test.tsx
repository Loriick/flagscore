import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { MatchItem } from "../MatchItem";
import { Match } from "@/src/app/types";

const mockMatch: Match = {
  id: 1,
  championship_id: 1,
  phase_id: 1,
  pool_id: 1,
  day_id: 1,
  sheet: "1",
  team_a: { name: "Équipe A", score: 21, general_forfeit: false },
  team_b: { name: "Équipe B", score: 14, general_forfeit: false },
  date: "2024-01-15T10:00:00Z",
};

describe("MatchItem", () => {
  it("renders match details correctly", () => {
    render(<MatchItem match={mockMatch} />);

    expect(screen.getByText("Équipe A")).toBeInTheDocument();
    expect(screen.getByText("Équipe B")).toBeInTheDocument();
    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("15 janv.")).toBeInTheDocument();
  });

  it("applies correct styling for winning team", () => {
    render(<MatchItem match={mockMatch} />);

    const winningTeam = screen.getByText("Équipe A");
    expect(winningTeam).toHaveClass("text-white");

    const winningScore = screen.getByText("21");
    expect(winningScore).toHaveClass("text-white");
  });

  it("applies correct styling for losing team", () => {
    render(<MatchItem match={mockMatch} />);

    const losingTeam = screen.getByText("Équipe B");
    expect(losingTeam).toHaveClass("text-gray-400", "text-sm");

    const losingScore = screen.getByText("14");
    expect(losingScore).toHaveClass("text-gray-400");
  });

  it("handles different match scenarios", () => {
    const differentMatch: Match = {
      ...mockMatch,
      team_a: { name: "Équipe C", score: 7, general_forfeit: false },
      team_b: { name: "Équipe D", score: 28, general_forfeit: false },
    };

    render(<MatchItem match={differentMatch} />);

    expect(screen.getByText("Équipe C")).toHaveClass(
      "text-gray-400",
      "text-sm"
    );
    expect(screen.getByText("Équipe D")).toHaveClass("text-white");
  });

  it("formats date correctly", () => {
    render(<MatchItem match={mockMatch} />);

    expect(screen.getByText("15 janv.")).toBeInTheDocument();
  });
});
