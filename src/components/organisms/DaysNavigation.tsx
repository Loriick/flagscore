import { memo } from "react";

import { Day } from "../../app/types";
import { DayButton } from "../molecules/DayButton";

// Import de cn pour éviter l'erreur
import { cn } from "@/lib/utils";

interface DaysNavigationProps {
  days: Day[];
  selectedDayId: number;
  onDaySelect: (day: Day) => void;
  className?: string;
}

export const DaysNavigation = memo(function DaysNavigation({
  days,
  selectedDayId,
  onDaySelect,
  className,
}: DaysNavigationProps) {
  if (days.length === 0) return null;

  return (
    <div className={cn("mb-4", className)}>
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {days.map(day => (
            <DayButton
              key={day.id}
              day={day}
              isSelected={selectedDayId === day.id}
              onClick={() => onDaySelect(day)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
