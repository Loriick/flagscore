import { memo } from "react";

import { Match } from "../app/types";

import { DeflagLoader } from "./DeflagLoader";
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
      <div className="text-center py-8">
        <DeflagLoader />
        <div className="text-white/60 text-sm mt-2">
          Chargement des matchs...
        </div>
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
