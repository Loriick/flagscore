import { memo } from "react";

import { Match } from "../app/types";

import { MatchItem } from "./MatchItem";

interface MatchesListProps {
  matches: Match[];
  loading: boolean;
}

export const MatchesList = memo(function MatchesList({
  matches,
  loading,
}: MatchesListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={`match-skeleton-${i}`}
            className="bg-white/5 rounded p-3 animate-pulse"
          >
            <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        ))}
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
          index={index}
        />
      ))}
    </div>
  );
});
