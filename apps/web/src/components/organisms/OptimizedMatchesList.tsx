import { memo } from "react";

import { Match } from "../../app/types";

import { MatchCard } from "./MatchCard";

interface OptimizedMatchesListProps {
  matches: Match[];
  loading: boolean;
  /** Message d'erreur à afficher quand les matchs n'ont pas pu être chargés. */
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  "data-testid"?: string;
}

export const OptimizedMatchesList = memo(function OptimizedMatchesList({
  matches,
  loading,
  error,
  onRetry,
  className = "",
  "data-testid": dataTestId,
}: OptimizedMatchesListProps) {
  if (loading && matches.length === 0) {
    return (
      <ul
        className={className}
        data-testid={dataTestId}
        aria-busy="true"
        aria-label="Chargement des matchs"
      >
        {[0, 1, 2, 3].map(i => (
          <li
            key={`loading-${i}`}
            className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 border-b border-line py-4"
          >
            <span className="h-6 w-3/5 animate-pulse rounded-sm bg-ink-raised" />
            <span className="h-9 w-10 animate-pulse rounded-sm bg-ink-raised" />
            <span className="h-6 w-2/5 animate-pulse rounded-sm bg-ink-raised" />
            <span className="h-9 w-10 animate-pulse rounded-sm bg-ink-raised" />
          </li>
        ))}
      </ul>
    );
  }

  if (matches.length === 0) {
    return (
      <div
        className={`border-b border-line py-8 ${className}`}
        data-testid={dataTestId}
      >
        {error ? (
          <>
            <p className="font-score text-2xl font-bold text-chalk">
              Scores indisponibles
            </p>
            <p className="mt-1 text-sm text-stone">
              Les résultats de cette journée n&apos;ont pas pu être chargés.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 inline-flex min-h-11 items-center rounded-[4px] bg-flag px-4 text-sm font-bold text-ink transition-colors hover:bg-flag-deep"
              >
                Réessayer
              </button>
            )}
          </>
        ) : (
          <>
            <p className="font-score text-2xl font-bold text-chalk">
              Pas encore de score
            </p>
            <p className="mt-1 text-sm text-stone">
              Aucun match n&apos;est enregistré pour cette journée.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <ul className={className} data-testid={dataTestId}>
      {matches.map((match, index) => (
        <MatchCard
          key={`match-${match.id}-${index}`}
          match={match}
          index={index}
        />
      ))}
    </ul>
  );
});
