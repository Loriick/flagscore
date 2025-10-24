import { memo } from "react";

import { Button } from "../atoms/Button";
import { Card } from "../atoms/Card";

// Import cn to avoid error
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState = memo(function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("text-center", className)}>
      <div className="flex flex-col items-center space-y-4">
        {icon && <div className="text-white/40">{icon}</div>}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          {description && (
            <p className="text-sm text-white/60">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
});
