import { memo, useMemo } from "react";

import { Match } from "../../app/types";
import { VirtualizedList } from "../atoms/VirtualizedList";

import { MatchCard } from "./MatchCard";

interface OptimizedMatchesListProps {
  matches: Match[];
  loading: boolean;
  className?: string;
  "data-testid"?: string;
}

export const OptimizedMatchesList = memo(function OptimizedMatchesList({
  matches,
  loading,
  className = "",
  "data-testid": dataTestId,
}: OptimizedMatchesListProps) {
  // Use virtualization only for long lists
  const shouldVirtualize = matches.length > 20;
  const itemHeight = 80; // Estimated height of a MatchCard

  const renderMatch = useMemo(
    () => (match: unknown, index: number) => {
      const matchData = match as Match;
      return (
        <MatchCard key={`match-${matchData.id}-${index}`} match={matchData} />
      );
    },
    []
  );

  // Afficher le skeleton seulement si on n'a pas encore de données ET qu'on charge
  if (loading && matches.length === 0) {
    return (
      <div className={`space-y-3 ${className}`} data-testid={dataTestId}>
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
      <div className={className} data-testid={dataTestId}>
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
    <div className={`space-y-3 ${className}`} data-testid={dataTestId}>
      {matches.map((match, index) => (
        <MatchCard key={`match-${match.id}-${index}`} match={match} />
      ))}
    </div>
  );
});
