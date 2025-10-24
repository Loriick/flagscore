import { memo } from "react";

import { Badge } from "../atoms/Badge";
import { Button } from "../atoms/Button";

// Import de cn pour éviter l'erreur
import { cn } from "@/lib/utils";

interface DayButtonProps {
  day: {
    id: number;
    label: string;
    date: string;
  };
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export const DayButton = memo(function DayButton({
  day,
  isSelected,
  onClick,
  className,
}: DayButtonProps) {
  return (
    <Button
      variant={isSelected ? "primary" : "outline"}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center space-y-1 min-w-[80px]",
        className
      )}
    >
      <span className="text-sm font-medium">{day.label}</span>
      <Badge variant="info" size="sm">
        {new Date(day.date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        })}
      </Badge>
    </Button>
  );
});
