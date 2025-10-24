import { memo, useMemo } from "react";

import { Match } from "../../app/types";
import { VirtualizedList } from "../atoms/VirtualizedList";

import { MatchCard } from "./MatchCard";

interface OptimizedMatchesListProps {
  matches: Match[];
  loading: boolean;
  className?: string;
}

export const OptimizedMatchesList = memo(function OptimizedMatchesList({
  matches,
  loading,
  className = "",
}: OptimizedMatchesListProps) {
  // Utiliser la virtualisation seulement pour les listes longues
  const shouldVirtualize = matches.length > 20;
  const itemHeight = 80; // Hauteur estimée d'un MatchCard

  const renderMatch = useMemo(
    () => (match: unknown, index: number) => {
      const matchData = match as Match;
      return (
        <MatchCard key={`match-${matchData.id}-${index}`} match={matchData} />
      );
    },
    []
  );

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div
            key={`loading-${i}`}
            className="bg-white/5 rounded p-3 animate-pulse"
          >
            <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (matches.length === 0 && !loading) {
    return null;
  }

  if (shouldVirtualize) {
    return (
      <div className={className}>
        <VirtualizedList
          items={matches}
          itemHeight={itemHeight}
          containerHeight={400}
          renderItem={renderMatch}
          overscan={5}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {matches.map((match, index) => (
        <MatchCard key={`match-${match.id}-${index}`} match={match} />
      ))}
    </div>
  );
});
