import { memo } from "react";

import { Day } from "../app/types";

interface DaysNavigationProps {
  days: Day[];
  onDaySelect: (day: Day) => void;
  selectedDayId?: number;
}

export const DaysNavigation = memo(function DaysNavigation({
  days,
  onDaySelect,
  selectedDayId,
}: DaysNavigationProps) {
  if (days.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="overflow-x-auto">
        <div className="flex gap-2">
          {days.map((day, index) => (
            <button
              key={day.id}
              id={`day-${day.id}`}
              name={`day-${day.id}`}
              aria-label={`Sélectionner la journée ${day.label}`}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                selectedDayId === day.id
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
              } ${index === 0 ? "shadow-sm" : ""}`}
              onClick={() => onDaySelect(day)}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
