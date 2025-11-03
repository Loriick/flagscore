import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DayButton } from "../../molecules/DayButton";

describe("DayButton", () => {
  it("définit aria-pressed selon selected", () => {
    const day = {
      id: 1,
      label: "J1",
      pool_id: 10,
      championship_id: 1,
      phase_id: 1,
      date: "2026-01-01",
      number: 1,
    } as any;
    const { rerender } = render(
      <DayButton day={day} onClick={() => {}} selected={false} />
    );
    const btn = screen.getByRole("button", { name: /J1/i });
    expect(btn).toHaveAttribute("aria-pressed", "false");

    rerender(<DayButton day={day} onClick={() => {}} selected={true} />);
    expect(screen.getByRole("button", { name: /J1/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("ne montre pas de ring au focus (classe utilitaire présente)", () => {
    const day = {
      id: 1,
      label: "J1",
      pool_id: 10,
      championship_id: 1,
      phase_id: 1,
      date: "2026-01-01",
      number: 1,
    } as any;
    render(<DayButton day={day} onClick={() => {}} selected={false} />);
    const btn = screen.getByRole("button", { name: /J1/i });
    // Vérifie que les classes anti-ring sont présentes
    expect(btn.className).toContain("focus:ring-0");
    expect(btn.className).toContain("focus:outline-none");
  });
});
