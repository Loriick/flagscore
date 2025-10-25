import { memo } from "react";

import { Button } from "../atoms/Button";

import { logger } from "@/lib/logger-advanced";

interface DayButtonProps {
  day: {
    id: number;
    label: string;
    date: string;
  };
  onClick: () => void;
  className?: string;
}

export const DayButton = memo(function DayButton({
  day,
  onClick,
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
    <Button variant="outline" onClick={handleClick}>
      {day.label}
    </Button>
  );
});
