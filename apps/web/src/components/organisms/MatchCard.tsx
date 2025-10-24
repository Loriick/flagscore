import { memo } from "react";

import { Match } from "../../app/types";
import { Badge } from "../atoms/Badge";
import { Card } from "../atoms/Card";

// Import cn to avoid error
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  className?: string;
}

export const MatchCard = memo(function MatchCard({
  match,
  className,
}: MatchCardProps) {
  const isFinished = match.team_a.score !== null && match.team_b.score !== null;
  const teamAWon = isFinished && match.team_a.score! > match.team_b.score!;
  const teamBWon = isFinished && match.team_b.score! > match.team_a.score!;

  return (
    <Card className={cn("hover:bg-white/10 transition-colors", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div
                className={cn(
                  "text-sm font-medium",
                  isFinished && !teamAWon ? "text-white/60" : "text-white"
                )}
              >
                {match.team_a.name}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isFinished ? "default" : "info"}>
                {isFinished ? `${match.team_a.score}` : "VS"}
              </Badge>
              <span className="text-white/40 text-xs">-</span>
              <Badge variant={isFinished ? "default" : "info"}>
                {isFinished ? `${match.team_b.score}` : "VS"}
              </Badge>
            </div>
            <div className="flex-1 text-right">
              <div
                className={cn(
                  "text-sm font-medium",
                  isFinished && !teamBWon ? "text-white/60" : "text-white"
                )}
              >
                {match.team_b.name}
              </div>
            </div>
          </div>
          {match.date && (
            <div className="mt-2 text-xs text-white/40">
              {new Date(match.date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});
