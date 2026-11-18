import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@flagscore/core/auth/server";
import {
  describePlateau,
  formatDay,
  PLATEAU_COLUMNS,
  type PlateauRow,
} from "@flagscore/core/sheets";
import { getSupabaseAdmin } from "@flagscore/core/supabase-admin";
import { cn, pageTitleClass, primaryButtonClass } from "@flagscore/ui/styles";

export const metadata: Metadata = { title: "Plateaux" };

export default async function PlateauxPage() {
  await requireRole(["admin"]);
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("plateaux")
    .select(
      `${PLATEAU_COLUMNS}, delegate_assignments(count), match_sheets(status)`
    )
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  const plateaux = data as unknown as Array<
    PlateauRow & {
      delegate_assignments: Array<{ count: number }>;
      match_sheets: Array<{ status: string }>;
    }
  >;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-5 pb-16 sm:px-6 sm:pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className={pageTitleClass}>Plateaux</h1>
        <Link href="/plateaux/nouveau" className={primaryButtonClass}>
          Nouveau plateau
        </Link>
      </div>
      {plateaux.length === 0 ? (
        <p className="border-y border-line py-10 text-sm text-stone">
          Aucun plateau pour l&apos;instant.
        </p>
      ) : (
        <ul>
          {plateaux.map(p => {
            const label = describePlateau(p);
            const sheets = p.match_sheets.length;
            const signed = p.match_sheets.filter(
              s => s.status === "signed"
            ).length;
            const delegates = p.delegate_assignments[0]?.count ?? 0;
            return (
              <li key={p.id} className="border-b border-line">
                <Link
                  href={`/plateaux/${p.id}`}
                  className="block py-4 hover:bg-ink-hover focus-visible:outline-offset-[-2px]"
                >
                  <span className="text-xs font-semibold tracking-wide text-stone">
                    {formatDay(p.date)} · {label.stage}
                  </span>
                  <span className="font-score block text-2xl font-bold text-chalk">
                    {label.pool}
                  </span>
                  <span className="text-sm text-stone">
                    {label.competition} · {p.venue}
                  </span>
                  <span className="mt-1 flex gap-4 text-sm tabular">
                    <span
                      className={cn(delegates ? "text-chalk" : "text-alert")}
                    >
                      {delegates
                        ? `${delegates} délégué${delegates > 1 ? "s" : ""}`
                        : "Aucun délégué"}
                    </span>
                    <span className="text-stone">
                      {signed}/{sheets} feuille{sheets > 1 ? "s" : ""} signée
                      {signed > 1 ? "s" : ""}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
