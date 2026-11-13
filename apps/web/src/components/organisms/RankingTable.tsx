import { memo } from "react";

import { Ranking } from "../../app/types";

import { cn } from "@/lib/utils";

interface RankingTableProps {
  rankings: Ranking[];
  /** Titre accessible du tableau, ex. « Classement IDF Nord ». */
  caption: string;
  loading?: boolean;
  /** Version compacte (colonne latérale) : masque G / N / P. */
  compact?: boolean;
  className?: string;
}

const formatDiff = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export const RankingTable = memo(function RankingTable({
  rankings,
  caption,
  loading = false,
  compact = false,
  className,
}: RankingTableProps) {
  if (loading && rankings.length === 0) {
    return (
      <div className={cn("space-y-2", className)} aria-busy="true">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-sm bg-ink-raised"
          />
        ))}
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <p
        className={cn(
          "border-y border-line py-6 text-sm text-stone",
          className
        )}
      >
        Le classement de cette poule n&apos;est pas encore disponible.
      </p>
    );
  }

  const detail = compact ? "hidden" : "hidden sm:table-cell";

  return (
    <table className={cn("w-full border-collapse text-sm tabular", className)}>
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-line text-left text-xs font-semibold text-stone">
          <th scope="col" className="w-8 py-2 pr-2 font-semibold">
            <abbr title="Position" className="no-underline">
              #
            </abbr>
          </th>
          <th scope="col" className="py-2 pr-3 font-semibold">
            Équipe
          </th>
          <th scope="col" className="w-9 py-2 text-right font-semibold">
            <abbr title="Matchs joués" className="no-underline">
              J
            </abbr>
          </th>
          <th
            scope="col"
            className={cn("w-9 py-2 text-right font-semibold", detail)}
          >
            <abbr title="Gagnés" className="no-underline">
              G
            </abbr>
          </th>
          <th
            scope="col"
            className={cn("w-9 py-2 text-right font-semibold", detail)}
          >
            <abbr title="Nuls" className="no-underline">
              N
            </abbr>
          </th>
          <th
            scope="col"
            className={cn("w-9 py-2 text-right font-semibold", detail)}
          >
            <abbr title="Perdus" className="no-underline">
              P
            </abbr>
          </th>
          <th scope="col" className="w-12 py-2 text-right font-semibold">
            <abbr
              title="Différence de points marqués et encaissés"
              className="no-underline"
            >
              Diff
            </abbr>
          </th>
          <th scope="col" className="w-12 py-2 text-right font-semibold">
            <abbr title="Points au classement" className="no-underline">
              Pts
            </abbr>
          </th>
        </tr>
      </thead>
      <tbody>
        {rankings.map(r => (
          <tr
            key={`${r.position}-${r.club.label}`}
            className="border-b border-line"
          >
            <td
              className={cn(
                "font-score py-2.5 pr-2 text-xl font-black",
                r.position === 1 ? "text-flag" : "text-stone"
              )}
            >
              {r.position}
            </td>
            <th
              scope="row"
              className="font-score py-2.5 pr-3 text-left text-lg leading-tight font-bold text-chalk"
            >
              {r.club.label}
              {r.qualification && (
                <span
                  title={`Place qualificative pour la ${r.qualification}`}
                  className={cn(
                    "font-sans ml-2 inline-block rounded-[3px] px-1.5 py-0.5 align-middle text-[0.6875rem] leading-none font-bold",
                    r.qualification === "D1"
                      ? "bg-flag text-ink"
                      : "border border-flag text-flag"
                  )}
                >
                  {r.qualification}
                </span>
              )}
            </th>
            <td className="py-2.5 text-right text-stone">{r.j}</td>
            <td className={cn("py-2.5 text-right text-stone", detail)}>
              {r.g}
            </td>
            <td className={cn("py-2.5 text-right text-stone", detail)}>
              {r.n}
            </td>
            <td className={cn("py-2.5 text-right text-stone", detail)}>
              {r.p}
            </td>
            <td className="py-2.5 text-right text-stone">
              {formatDiff(r.points_diff)}
            </td>
            <td className="font-score py-2.5 text-right text-2xl font-black text-chalk">
              {r.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});
