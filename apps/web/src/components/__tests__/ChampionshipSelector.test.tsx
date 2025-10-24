import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ChampionshipSelector } from "../ChampionshipSelector";

const mockChampionships = [
  { id: 1, label: "Championnat de France mixte", season: 2026, male: false },
  { id: 2, label: "Coupe de France", season: 2026, male: false },
];

describe("ChampionshipSelector", () => {
  const mockOnChampionshipChange = vi.fn();
  const defaultProps = {
    championships: mockChampionships,
    selectedChampionshipId: 1,
    onChampionshipChange: mockOnChampionshipChange,
    loading: false,
  };

  beforeEach(() => {
    mockOnChampionshipChange.mockClear();
  });

  it("renders championship selector with selected championship", () => {
    render(<ChampionshipSelector {...defaultProps} />);

    expect(screen.getByText("Compétition")).toBeInTheDocument();
    expect(screen.getByText("Championnat de France mixte")).toBeInTheDocument();
  });

  it("shows loading state when loading is true", () => {
    render(<ChampionshipSelector {...defaultProps} loading={true} />);

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("is disabled when no championships", () => {
    render(<ChampionshipSelector {...defaultProps} championships={[]} />);

    expect(
      screen.getByText("Sélectionner une compétition")
    ).toBeInTheDocument();
  });

  it("renders with different championships", () => {
    const differentChampionships = [
      { id: 3, label: "Championnat Régional", season: 2026, male: false },
      { id: 4, label: "Tournoi Local", season: 2026, male: false },
    ];

    render(
      <ChampionshipSelector
        {...defaultProps}
        championships={differentChampionships}
        selectedChampionshipId={3}
      />
    );

    expect(screen.getByText("Championnat Régional")).toBeInTheDocument();
  });
});
