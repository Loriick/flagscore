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
  return (
    <div className={cn("mb-4", className)} data-testid={dataTestId}>
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {days.length === 0 ? (
            <div className="text-white/60 text-sm px-4 py-2">
              Aucune journée disponible
            </div>
          ) : (
            days.map(day => (
              <DayButton
                key={day.id}
                day={day}
                onClick={() => onDaySelect(day)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
});
