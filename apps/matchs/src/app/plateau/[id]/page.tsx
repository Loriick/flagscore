import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  describePlateau,
  editWindow,
  formatDay,
  idInput,
  isWithinEditWindow,
  loadSheets,
  REQUIRED_SIGNATURES,
  resultLabel,
  teamLabel,
} from "@flagscore/core/sheets";
import { getSupabaseAdmin } from "@flagscore/core/supabase-admin";
import { ActionForm } from "@flagscore/ui/ActionForm";
import {
  cn,
  pageTitleClass,
  secondaryButtonClass,
  sectionBarClass,
} from "@flagscore/ui/styles";

import { createSheet } from "../actions";

import { assignedPlateau, requireDelegate } from "@/lib/access";

export const metadata: Metadata = { title: "Plateau" };

const pairKey = (a: string, b: string) => [a, b].sort().join("|");

export default async function PlateauPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireDelegate();
  const id = idInput.safeParse((await params).id).data;
  const plateau = id ? await assignedPlateau(session, id) : null;
  if (!plateau) notFound();

  const label = describePlateau(plateau);
  const editable = isWithinEditWindow(plateau.date);
  const sheets = await loadSheets(getSupabaseAdmin(), [plateau.id]);
  const used = new Set(
    sheets.map(s => pairKey(s.row.team_home, s.row.team_away))
  );
  const pairs = label.teams.flatMap((a, i) =>
    label.teams
      .slice(i + 1)
      .filter(b => !used.has(pairKey(a.ref, b.ref)))
      .map(b => [a, b] as const)
  );
  const opening = editWindow(plateau.date);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pt-5 pb-16 sm:px-6 sm:pt-10">
      <header>
        <p className="text-xs font-semibold tracking-wide text-stone">
          {label.competition} · {label.stage}
        </p>
        <h1 className={cn(pageTitleClass, "mt-1")}>{label.pool}</h1>
        <p className="mt-2 text-sm text-chalk">
          {formatDay(plateau.date)} · {plateau.venue}
        </p>
        {!editable && (
          <p className="mt-3 border-l-[3px] border-line pl-3 text-sm text-stone">
            Lecture seule : la saisie est ouverte du {formatDay(opening.from)}{" "}
            au {formatDay(opening.to)}.
          </p>
        )}
      </header>

      <section>
        <h2 className={sectionBarClass}>Matchs</h2>
        {sheets.length === 0 ? (
          <p className="py-4 text-sm text-stone">Aucun match saisi.</p>
        ) : (
          <ul>
            {sheets.map(({ row, signatures }) => (
              <li key={row.id} className="border-b border-line">
                <Link
                  href={`/plateau/${plateau.id}/match/${row.id}`}
                  className="flex min-h-16 items-center justify-between gap-3 py-3 hover:bg-ink-hover"
                >
                  <span>
                    <span className="font-score block text-xl leading-tight font-bold text-chalk">
                      {teamLabel(row.team_home)}
                    </span>
                    <span className="font-score block text-xl leading-tight font-bold text-chalk">
                      {teamLabel(row.team_away)}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="font-score block text-2xl font-black text-flag">
                      {resultLabel(row) ?? "—"}
                    </span>
                    <span className="text-xs font-semibold text-stone">
                      {row.status === "signed"
                        ? "Signée"
                        : `${signatures.length}/${REQUIRED_SIGNATURES.length} signatures`}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editable && pairs.length > 0 && (
        <section>
          <h2 className="font-score text-xl font-black text-chalk">
            Nouveau match
          </h2>
          <p className="mt-1 mb-3 text-sm text-stone">
            Touche l&apos;affiche du match à saisir.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {pairs.map(([a, b]) => (
              <li key={`${a.ref}|${b.ref}`}>
                <ActionForm
                  action={createSheet}
                  submitLabel={`${a.label} – ${b.label}`}
                  buttonClass={cn(secondaryButtonClass, "w-full")}
                >
                  <input type="hidden" name="plateauId" value={plateau.id} />
                  <input type="hidden" name="teamA" value={a.ref} />
                  <input type="hidden" name="teamB" value={b.ref} />
                </ActionForm>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
