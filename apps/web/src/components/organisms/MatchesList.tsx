import { memo } from "react";

import { Match } from "@flagscore/shared";
import { LoadingCard } from "../molecules/LoadingCard";
import { MatchCard } from "../organisms/MatchCard";

// Import de cn pour éviter l'erreur
import { cn } from "@/lib/utils";

interface MatchesListProps {
  matches: Match[];
  loading: boolean;
  className?: string;
}

export const MatchesList = memo(function MatchesList({
  matches,
  loading,
  className,
}: MatchesListProps) {
  if (loading) {
    return (
      <LoadingCard
        title="Chargement des matchs..."
        description="Récupération des données en cours"
        className={className}
      />
    );
  }

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {matches.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
});
