import Link from "next/link";

import {
  describePlateau,
  formatDay,
  isWithinEditWindow,
  PLATEAU_COLUMNS,
  type PlateauRow,
  teamLabel,
} from "@flagscore/core/sheets";
import { getSupabaseAdmin } from "@flagscore/core/supabase-admin";
import { cn, pageTitleClass } from "@flagscore/ui/styles";

import { requireDelegate } from "@/lib/access";

export default async function MyPlateaux() {
  const session = await requireDelegate();
  const db = getSupabaseAdmin();
  const { data: assignments, error } = await db
    .from("delegate_assignments")
    .select("plateau_id")
    .eq("user_id", session.user.id);
  if (error) throw new Error(error.message);
  const ids = assignments.map(a => a.plateau_id as string);
  const { data } = ids.length
    ? await db
        .from("plateaux")
        .select(PLATEAU_COLUMNS)
        .in("id", ids)
        .order("date", { ascending: false })
    : { data: [] };
  const plateaux = (data ?? []) as PlateauRow[];
  const active = plateaux.filter(p => isWithinEditWindow(p.date));
  const others = plateaux.filter(p => !isWithinEditWindow(p.date));

  return (
    <div className="mx-auto max-w-3xl px-4 pt-5 pb-16 sm:px-6 sm:pt-10">
      <h1 className={cn(pageTitleClass, "mb-6")}>Mes plateaux</h1>
      {plateaux.length === 0 && (
        <p className="border-y border-line py-10 text-sm text-stone">
          Aucun plateau ne t&apos;est confié pour l&apos;instant. L&apos;admin
          de Flagscore t&apos;enverra une invitation par email.
        </p>
      )}
      {active.length > 0 && (
        <section className="mb-10">
          <h2 className="font-score rounded-[4px] bg-flag px-4 py-2 text-xl font-black text-ink">
            En ce moment
          </h2>
          <PlateauList plateaux={active} />
        </section>
      )}
      {others.length > 0 && (
        <section>
          <h2 className="font-score text-xl font-black text-stone">
            Autres plateaux · lecture seule
          </h2>
          <PlateauList plateaux={others} />
        </section>
      )}
    </div>
  );
}

function PlateauList({ plateaux }: { plateaux: PlateauRow[] }) {
  return (
    <ul>
      {plateaux.map(p => {
        const label = describePlateau(p);
        return (
          <li key={p.id} className="border-b border-line">
            <Link
              href={`/plateau/${p.id}`}
              className="block min-h-11 py-4 hover:bg-ink-hover"
            >
              <span className="text-xs font-semibold tracking-wide text-stone">
                {formatDay(p.date)} · {p.venue}
              </span>
              <span className="font-score block text-2xl font-bold text-chalk">
                {label.pool} · {label.stage}
              </span>
              <span className="text-sm text-stone">
                {label.teams.map(t => teamLabel(t.ref)).join(", ")}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
