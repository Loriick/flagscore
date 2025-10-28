import { memo } from "react";

import { Match } from "@flagscore/shared";

import { MatchItem } from "./MatchItem";
import { SkeletonLoader } from "./SkeletonLoader";

interface MatchesListProps {
  matches: Match[];
  loading: boolean;
}

export const MatchesList = memo(function MatchesList({
  matches,
  loading,
}: MatchesListProps) {
  // Afficher le skeleton seulement si on n'a pas encore de données ET qu'on charge
  if (loading && matches.length === 0) {
    return (
      <div className="text-center py-8">
        <SkeletonLoader />
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div className="space-y-2">
      {matches.map((match, index) => (
        <MatchItem
          key={`match-${match.id || match.team_a.name}-${
            match.team_b.name
          }-${index}`}
          match={match}
        />
      ))}
    </div>
  );
});
