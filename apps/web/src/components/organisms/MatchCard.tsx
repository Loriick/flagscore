import { memo, type CSSProperties } from "react";

import { Match } from "../../app/types";

import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  className?: string;
  /** Rang dans la liste, pour l'apparition en cascade. */
  index?: number;
}

type Outcome = "win" | "loss" | "draw" | "upcoming";

function outcomes(match: Match): [Outcome, Outcome] {
  const a = match.team_a.score;
  const b = match.team_b.score;
  if (a === null || b === null || a === undefined || b === undefined) {
    return ["upcoming", "upcoming"];
  }
  if (a === b) return ["draw", "draw"];
  return a > b ? ["win", "loss"] : ["loss", "win"];
}

const NAME_TONE: Record<Outcome, string> = {
  win: "text-chalk",
  draw: "text-chalk",
  loss: "text-stone",
  upcoming: "text-chalk",
};

const SCORE_TONE: Record<Outcome, string> = {
  win: "text-flag",
  draw: "text-chalk",
  loss: "text-stone",
  upcoming: "text-stone",
};

function TeamLine({
  name,
  score,
  outcome,
}: {
  name: string;
  score: number | null;
  outcome: Outcome;
}) {
  return (
    <>
      <span
        className={cn(
          "font-score min-w-0 text-[1.5rem] leading-[1.05] font-bold break-words sm:text-[1.75rem]",
          NAME_TONE[outcome]
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          "font-score text-right text-[2.875rem] leading-[0.9] font-black sm:text-[3.5rem]",
          SCORE_TONE[outcome]
        )}
      >
        {outcome === "upcoming" ? "" : score}
      </span>
    </>
  );
}

export const MatchCard = memo(function MatchCard({
  match,
  className,
  index = 0,
}: MatchCardProps) {
  const [a, b] = outcomes(match);
  const upcoming = a === "upcoming";
  const label = upcoming
    ? `${match.team_a.name} contre ${match.team_b.name}, à venir`
    : `${match.team_a.name} ${match.team_a.score}, ${match.team_b.name} ${match.team_b.score}`;

  return (
    <li
      className={cn("score-reveal border-b border-line py-4", className)}
      style={{ "--i": index } as CSSProperties}
      aria-label={label}
    >
      <div
        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1.5"
        aria-hidden="true"
      >
        <TeamLine
          name={match.team_a.name}
          score={match.team_a.score}
          outcome={a}
        />
        <TeamLine
          name={match.team_b.name}
          score={match.team_b.score}
          outcome={b}
        />
      </div>
      {match.sources && match.sources.length > 0 && (
        <p className="mt-2 text-xs text-stone">
          {match.sources.length > 1 ? "Confirmé par " : "D'après "}
          {match.sources.map((handle, i) => (
            <span key={handle}>
              {i > 0 && " et "}
              <a
                href={`https://www.instagram.com/${handle}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-line underline-offset-2 transition-colors hover:text-flag"
              >
                @{handle}
              </a>
            </span>
          ))}
        </p>
      )}
    </li>
  );
});
