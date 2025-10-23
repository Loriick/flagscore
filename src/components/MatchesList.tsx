import { Match } from "../app/types";

interface MatchesListProps {
  matches: Match[];
  loading: boolean;
}

export function MatchesList({ matches, loading }: MatchesListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded p-3 animate-pulse">
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
      {matches.map((match, index) => {
        const teamAWon = match.team_a.score > match.team_b.score;
        const teamBWon = match.team_b.score > match.team_a.score;

        return (
          <div key={`match-${index}`} className="bg-white/10 rounded p-3">
            <div className="text-center">
              <div className="font-medium flex items-center justify-center gap-2">
                <span
                  className={
                    teamAWon
                      ? "text-white"
                      : teamBWon
                      ? "text-gray-400 text-sm"
                      : "text-white"
                  }
                >
                  {match.team_a.name}
                </span>
                <span
                  className={
                    teamAWon
                      ? "text-white"
                      : teamBWon
                      ? "text-gray-400 text-sm"
                      : "text-white"
                  }
                >
                  {match.team_a.score}
                </span>
                <span className="text-white">-</span>
                <span
                  className={
                    teamBWon
                      ? "text-white"
                      : teamAWon
                      ? "text-gray-400 text-sm"
                      : "text-white"
                  }
                >
                  {match.team_b.score}
                </span>
                <span
                  className={
                    teamBWon
                      ? "text-white"
                      : teamAWon
                      ? "text-gray-400 text-sm"
                      : "text-white"
                  }
                >
                  {match.team_b.name}
                </span>
              </div>
              <div className="text-xs text-white/60 mt-1">
                {new Date(match.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
