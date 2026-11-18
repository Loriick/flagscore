import type { SupabaseClient } from "@supabase/supabase-js";

import type { manualMatchRow } from "./results";

/**
 * Décisions de la page Scores de l'admin sur `social_matches` : valider
 * (avec correction), rejeter, annuler la décision, ou ajouter un match saisi
 * à la main.
 */

export type ReviewAction =
  | { type: "approve"; scoreHome: number; scoreAway: number }
  | { type: "reject" }
  | { type: "reset" };

export type ReviewOutcome =
  | { ok: true; updated?: boolean }
  | { ok: false; status: 404 | 409; message: string };

/** Score venu d'une feuille de match : il ne se décide que sur le plateau. */
export const SHEET_LOCKED =
  "Score venu d'une feuille de match : il ne se modifie pas ici. Pour le changer, utilisez « Rouvrir » sur la page du plateau.";

const locked: ReviewOutcome = { ok: false, status: 409, message: SHEET_LOCKED };

const MANUAL_REASON = "Saisi à la main";

interface ReviewedRow {
  match_key: string;
  reason: string | null;
  observation_ids: string[] | null;
  source: "instagram" | "manual" | "delegate";
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

async function findRow(db: SupabaseClient, matchKey: string) {
  const rows = check(
    await db
      .from("social_matches")
      .select("match_key, reason, observation_ids, source")
      .eq("match_key", matchKey)
  ) as ReviewedRow[];
  return rows[0] ?? null;
}

export async function reviewMatch(
  db: SupabaseClient,
  matchKey: string,
  action: ReviewAction
): Promise<ReviewOutcome> {
  const row = await findRow(db, matchKey);
  if (!row) return { ok: false, status: 404, message: "Match introuvable" };
  if (row.source === "delegate") return locked;

  // Annuler un match saisi à la main : il n'a pas d'autre source, on le
  // supprime.
  if (
    action.type === "reset" &&
    row.reason === MANUAL_REASON &&
    !row.observation_ids?.length
  ) {
    check(
      await db
        .from("social_matches")
        .delete()
        .eq("match_key", matchKey)
        .neq("source", "delegate")
    );
    return { ok: true };
  }

  const update =
    action.type === "approve"
      ? {
          review: "approved",
          review_score_home: action.scoreHome,
          review_score_away: action.scoreAway,
          reviewed_at: new Date().toISOString(),
        }
      : action.type === "reject"
        ? {
            review: "rejected",
            review_score_home: null,
            review_score_away: null,
            reviewed_at: new Date().toISOString(),
          }
        : {
            review: null,
            review_score_home: null,
            review_score_away: null,
            reviewed_at: null,
          };
  check(
    await db
      .from("social_matches")
      .update(update)
      .eq("match_key", matchKey)
      .neq("source", "delegate")
  );
  return { ok: true };
}

/**
 * Ajoute un match dont le score est connu par un autre moyen qu'Instagram.
 * Match déjà vu sur Instagram : on garde ses sources et on enregistre la
 * saisie comme une décision.
 */
export async function addManualMatch(
  db: SupabaseClient,
  row: NonNullable<ReturnType<typeof manualMatchRow>>
): Promise<ReviewOutcome> {
  const reviewedAt = new Date().toISOString();
  const existing = await findRow(db, row.match_key);
  if (existing?.source === "delegate") return locked;
  check(
    existing
      ? await db
          .from("social_matches")
          .update({
            review: "approved",
            review_score_home: row.review_score_home,
            review_score_away: row.review_score_away,
            reviewed_at: reviewedAt,
          })
          .eq("match_key", row.match_key)
          .neq("source", "delegate")
      : await db
          .from("social_matches")
          .insert({ ...row, reviewed_at: reviewedAt })
  );
  return { ok: true, updated: !!existing };
}
