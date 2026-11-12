import { memo } from "react";

import { logger } from "@/lib/logger-advanced";
import { cn } from "@/lib/utils";

interface DayButtonProps {
  day: {
    id: number;
    label: string;
    date: string;
  };
  onClick: () => void;
  className?: string;
  selected?: boolean;
}

export const DayButton = memo(function DayButton({
  day,
  onClick,
  className,
  selected = false,
}: DayButtonProps) {
  const handleClick = () => {
    logger.logUserAction("day_selected", {
      dayId: day.id,
      dayLabel: day.label,
      dayDate: day.date,
      source: "supabase",
    });

    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      className={cn(
        "font-score relative min-h-11 shrink-0 px-3 pt-2.5 pb-2 text-base font-bold whitespace-nowrap sm:text-lg transition-colors focus-visible:-outline-offset-2",
        selected
          ? "text-chalk after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-flag"
          : "text-stone hover:text-chalk",
        className
      )}
    >
      {day.label}
    </button>
  );
});
