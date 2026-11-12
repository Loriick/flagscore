import { memo } from "react";

import { Day } from "../../app/types";
import { DayButton } from "../molecules/DayButton";

import { cn } from "@/lib/utils";

interface DaysNavigationProps {
  days: Day[];
  onDaySelect: (day: Day) => void;
  selectedDayId?: number;
  className?: string;
  "data-testid"?: string;
}

export const DaysNavigation = memo(function DaysNavigation({
  days,
  onDaySelect,
  selectedDayId,
  className,
  "data-testid": dataTestId,
}: DaysNavigationProps) {
  return (
    <div
      className={cn("border-b border-line", className)}
      data-testid={dataTestId}
    >
      {days.length === 0 ? (
        <p className="py-3 text-sm text-stone">Aucune journée disponible</p>
      ) : (
        <div
          className="-mx-3 flex overflow-x-auto [scrollbar-width:none]"
          role="group"
          aria-label="Journées"
        >
          {days.map(day => (
            <DayButton
              key={day.id}
              day={day}
              selected={selectedDayId === day.id}
              onClick={() => onDaySelect(day)}
            />
          ))}
        </div>
      )}
    </div>
  );
});
