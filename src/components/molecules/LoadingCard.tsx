import { memo } from "react";

import { Card } from "../atoms/Card";
import { Spinner } from "../atoms/Spinner";

// Import de cn pour éviter l'erreur
import { cn } from "@/lib/utils";

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export const LoadingCard = memo(function LoadingCard({
  title = "Chargement...",
  description,
  className,
}: LoadingCardProps) {
  return (
    <Card className={cn("text-center", className)}>
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          {description && (
            <p className="text-sm text-white/60">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
});
