import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { SeasonSelector } from "../SeasonSelector";

describe("SeasonSelector", () => {
  const mockOnSeasonChange = vi.fn();
  const defaultProps = {
    seasons: [2025, 2026],
    currentSeason: 2026,
    onSeasonChange: mockOnSeasonChange,
  };

  beforeEach(() => {
    mockOnSeasonChange.mockClear();
  });

  it("renders season selector with current season", () => {
    render(<SeasonSelector {...defaultProps} />);

    expect(screen.getByText("Saison")).toBeInTheDocument();
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("renders with different seasons", () => {
    const props = { ...defaultProps, seasons: [2024, 2025, 2026] };
    render(<SeasonSelector {...props} />);

    expect(screen.getByText("2026")).toBeInTheDocument();
  });
});
