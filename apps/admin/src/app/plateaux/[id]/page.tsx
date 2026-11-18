import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireRole } from "@flagscore/core/auth/server";
import {
  describePlateau,
  formatDay,
  idInput,
  loadSheets,
  PLATEAU_COLUMNS,
  type PlateauRow,
  REQUIRED_SIGNATURES,
  resultLabel,
  ROLE_LABEL,
  teamLabel,
} from "@flagscore/core/sheets";
import { getSupabaseAdmin } from "@flagscore/core/supabase-admin";
import { SignatureSvg } from "@flagscore/ui/SignatureSvg";
import {
  cn,
  dangerButtonClass,
  inputClass,
  labelClass,
  pageTitleClass,
  secondaryButtonClass,
  sectionBarClass,
} from "@flagscore/ui/styles";

import {
  deletePlateau,
  invite,
  removeDelegate,
  reopen,
  resendInvite,
} from "../actions";

import { ActionForm } from "@flagscore/ui/ActionForm";
import { PlateauForm } from "@/components/PlateauForm";

export const metadata: Metadata = { title: "Plateau" };

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });

async function loadDelegates(plateauId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("delegate_assignments")
    .select("user_id, invited_at")
    .eq("plateau_id", plateauId);
  if (error) throw new Error(error.message);
  const ids = data.map(a => a.user_id as string);
  const { data: profiles } = ids.length
    ? await db.from("profiles").select("user_id, full_name").in("user_id", ids)
    : { data: [] };
  return Promise.all(
    data.map(async a => {
      const { data: user } = await db.auth.admin.getUserById(a.user_id);
      return {
        userId: a.user_id as string,
        invitedAt: a.invited_at as string | null,
        email: user.user?.email ?? "",
        name:
          profiles?.find(p => p.user_id === a.user_id)?.full_name ??
          user.user?.email ??
          "",
      };
    })
  );
}

export default async function PlateauPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const id = idInput.safeParse((await params).id).data;
  if (!id) notFound();
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("plateaux")
    .select(PLATEAU_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const plateau = data as PlateauRow;
  const label = describePlateau(plateau);
  const [delegates, sheets] = await Promise.all([
    loadDelegates(id),
    loadSheets(db, [id]),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 pt-5 pb-16 sm:px-6 sm:pt-10">
      <header>
        <p className="text-xs font-semibold tracking-wide text-stone">
          {label.competition} · {label.stage}
        </p>
        <h1 className={cn(pageTitleClass, "mt-1")}>{label.pool}</h1>
        <p className="mt-2 text-sm text-chalk">
          {formatDay(plateau.date)} · {plateau.venue}
          {plateau.host_club && ` · reçu par ${plateau.host_club}`}
        </p>
        <details className="mt-4 border-y border-line py-3">
          <summary className="cursor-pointer text-sm font-semibold text-stone hover:text-chalk">
            Modifier le plateau
          </summary>
          <div className="mt-4 space-y-6">
            <PlateauForm initial={plateau} locked={sheets.length > 0} />
            {sheets.length === 0 && (
              <form action={deletePlateau}>
                <input type="hidden" name="id" value={plateau.id} />
                <button type="submit" className={dangerButtonClass}>
                  Supprimer le plateau
                </button>
              </form>
            )}
          </div>
        </details>
      </header>

      <section>
        <h2 className={sectionBarClass}>Délégués</h2>
        {delegates.length === 0 ? (
          <p className="py-4 text-sm text-stone">
            Personne n&apos;est encore délégué sur ce plateau.
          </p>
        ) : (
          <ul>
            {delegates.map(d => (
              <li
                key={d.userId}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3"
              >
                <div>
                  <p className="font-semibold text-chalk">{d.name}</p>
                  <p className="text-sm text-stone">
                    {d.email}
                    {d.invitedAt &&
                      ` · invité le ${formatDateTime(d.invitedAt)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ActionForm
                    action={resendInvite}
                    submitLabel="Renvoyer l'invitation"
                    buttonClass={secondaryButtonClass}
                  >
                    <input type="hidden" name="plateauId" value={plateau.id} />
                    <input type="hidden" name="userId" value={d.userId} />
                  </ActionForm>
                  <form action={removeDelegate}>
                    <input type="hidden" name="plateauId" value={plateau.id} />
                    <input type="hidden" name="userId" value={d.userId} />
                    <button type="submit" className={secondaryButtonClass}>
                      Retirer
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        <ActionForm
          action={invite}
          submitLabel="Inviter"
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <input type="hidden" name="plateauId" value={plateau.id} />
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Nom
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={inputClass}
            />
          </div>
        </ActionForm>
      </section>

      <section>
        <h2 className={sectionBarClass}>Feuilles de match</h2>
        {sheets.length === 0 ? (
          <p className="py-4 text-sm text-stone">
            Aucune feuille saisie sur ce plateau.
          </p>
        ) : (
          <ul>
            {sheets.map(({ row, signatures, injuries }) => (
              <li key={row.id} className="border-b border-line py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-score text-xl font-bold text-chalk">
                    {teamLabel(row.team_home)} – {teamLabel(row.team_away)}
                  </p>
                  <p className="font-score text-2xl font-black text-flag">
                    {resultLabel(row) ?? "Score non saisi"}
                  </p>
                </div>
                <p className="mt-1 text-sm text-stone">
                  {row.status === "signed"
                    ? `Signée le ${formatDateTime(row.signed_at!)}`
                    : `Brouillon · ${signatures.length}/${REQUIRED_SIGNATURES.length} signatures`}
                </p>

                {signatures.length > 0 && (
                  <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {signatures.map(s => (
                      <li
                        key={`${s.side}-${s.role}`}
                        className="text-xs text-stone"
                      >
                        <SignatureSvg
                          path={s.signature_svg}
                          label={`Signature de ${s.signer_name}`}
                          className="h-12 w-full rounded-[4px] border border-line text-chalk"
                        />
                        {ROLE_LABEL[s.role]}{" "}
                        {teamLabel(
                          s.side === "home" ? row.team_home : row.team_away
                        )}{" "}
                        · {s.signer_name}
                      </li>
                    ))}
                  </ul>
                )}

                {injuries.length > 0 && (
                  <div className="mt-3">
                    <p className={labelClass}>Blessés</p>
                    <ul className="text-sm text-chalk">
                      {injuries.map(i => (
                        <li key={i.id}>
                          {i.player_name}
                          {i.jersey_number && ` (n° ${i.jersey_number})`} ·{" "}
                          {teamLabel(
                            i.side === "home" ? row.team_home : row.team_away
                          )}
                          {i.moment && ` · ${i.moment}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {row.status === "signed" && (
                  <ActionForm
                    action={reopen}
                    submitLabel="Rouvrir la feuille"
                    buttonClass={cn(secondaryButtonClass, "mt-4")}
                    confirmMessage="Rouvrir efface les quatre signatures et retire le score du site jusqu'à la nouvelle signature. Continuer ?"
                  >
                    <input type="hidden" name="sheetId" value={row.id} />
                  </ActionForm>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
