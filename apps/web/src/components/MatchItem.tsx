import { memo } from "react";

import { Match } from "../app/types";

interface MatchItemProps {
  match: Match;
}

export const MatchItem = memo(function MatchItem({ match }: MatchItemProps) {
  const teamAWon = match.team_a.score > match.team_b.score;
  const teamBWon = match.team_b.score > match.team_a.score;

  const teamAStyle = teamAWon
    ? "text-white"
    : teamBWon
      ? "text-gray-400 text-sm"
      : "text-white";
  const teamBStyle = teamBWon
    ? "text-white"
    : teamAWon
      ? "text-gray-400 text-sm"
      : "text-white";

  return (
    <div className="bg-white/10 rounded p-3">
      <div className="text-center">
        <div className="font-medium text-sm flex items-center justify-center gap-2">
          <span className={teamAStyle}>{match.team_a.name}</span>
          <span className={teamAStyle}>{match.team_a.score}</span>
          <span className="text-white">-</span>
          <span className={teamBStyle}>{match.team_b.score}</span>
          <span className={teamBStyle}>{match.team_b.name}</span>
        </div>
      </div>
    </div>
  );
});
