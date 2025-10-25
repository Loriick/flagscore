import { memo } from "react";

import { Day } from "../../app/types";
import { DayButton } from "../molecules/DayButton";

// Import cn to avoid error
import { cn } from "@/lib/utils";

interface DaysNavigationProps {
  days: Day[];
  onDaySelect: (day: Day) => void;
  className?: string;
  "data-testid"?: string;
}

export const DaysNavigation = memo(function DaysNavigation({
  days,
  onDaySelect,
  className,
  "data-testid": dataTestId,
}: DaysNavigationProps) {
  if (days.length === 0) return null;

  return (
    <div className={cn("mb-4", className)} data-testid={dataTestId}>
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {days.map(day => (
            <DayButton
              key={day.id}
              day={day}
              onClick={() => onDaySelect(day)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
