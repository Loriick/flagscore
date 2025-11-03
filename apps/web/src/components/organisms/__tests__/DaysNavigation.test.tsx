import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DaysNavigation } from "../../organisms/DaysNavigation";

describe("DaysNavigation", () => {
  it("applique aria-pressed sur le jour sélectionné", () => {
    const days = [
      {
        id: 1,
        label: "J1",
        pool_id: 10,
        championship_id: 1,
        phase_id: 1,
        date: "2026-01-01",
        number: 1,
      },
      {
        id: 2,
        label: "J2",
        pool_id: 10,
        championship_id: 1,
        phase_id: 1,
        date: "2026-01-08",
        number: 2,
      },
    ];

    render(
      <DaysNavigation
        days={days as any}
        selectedDayId={2}
        onDaySelect={() => {}}
      />
    );

    const selected = screen.getByRole("button", { name: /J2/i });
    expect(selected).toHaveAttribute("aria-pressed", "true");
  });
});
