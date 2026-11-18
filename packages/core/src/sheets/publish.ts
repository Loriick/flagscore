import type { SupabaseClient } from "@supabase/supabase-js";

import { poolMatch } from "../social/results";

import type { Side } from "./machine";

export const SIGNED_REASON = "Feuille signée par les deux équipes";

export interface PublishableSheet {
  match_key: string;
  team_home: string;
  team_away: string;
  score_home: number | null;
  score_away: number | null;
  forfeit: Side | null;
}

export interface PublishablePlateau {
  pool_id: number;
  event_key: string;
}

/**
 * Ligne `social_matches` d'une feuille signée : même clé et même orientation
 * que la saisie à la main et que le pipeline Instagram (`poolMatch`), score
 * stocké comme une décision humaine pour que la collecte ne l'écrase jamais.
 * Renvoie null si la feuille ne correspond plus à un match de la poule.
 */
export function publishRow(
  sheet: PublishableSheet,
  plateau: PublishablePlateau
) {
  const match = poolMatch({
    poolId: plateau.pool_id,
    eventKey: plateau.event_key,
    teamA: sheet.team_home,
    teamB: sheet.team_away,
  });
  if (!match || match.row.match_key !== sheet.match_key) return null;
  return {
    ...match.row,
    score_home: sheet.score_home,
    score_away: sheet.score_away,
    forfeit: sheet.forfeit,
    status: "single_source",
    auto_apply: false,
    source: "delegate",
    review: "approved",
    review_score_home: sheet.score_home,
    review_score_away: sheet.score_away,
    reason: SIGNED_REASON,
    accounts: [] as string[],
    observation_ids: [] as string[],
  };
}

const check = (res: { error: { message: string } | null }) => {
  if (res.error) throw new Error(res.error.message);
};

/**
 * Publie le score d'une feuille signée. Une ligne déjà vue sur Instagram garde
 * ses sources : on n'y écrit que la décision, comme la saisie à la main.
 */
export async function publishSheet(
  db: SupabaseClient,
  sheet: PublishableSheet,
  plateau: PublishablePlateau
) {
  const row = publishRow(sheet, plateau);
  if (!row)
    throw new Error(`Match introuvable dans la poule : ${sheet.match_key}`);
  const reviewedAt = new Date().toISOString();
  const { data: existing, error } = await db
    .from("social_matches")
    .select("match_key")
    .eq("match_key", row.match_key);
  if (error) throw new Error(error.message);
  check(
    existing?.length
      ? await db
          .from("social_matches")
          .update({
            source: row.source,
            review: row.review,
            reason: row.reason,
            review_score_home: row.review_score_home,
            review_score_away: row.review_score_away,
            forfeit: row.forfeit,
            reviewed_at: reviewedAt,
          })
          .eq("match_key", row.match_key)
      : await db
          .from("social_matches")
          .insert({ ...row, reviewed_at: reviewedAt })
  );
}

const REOPENED_REASON = "Feuille rouverte";

/**
 * Feuille rouverte : le score disparaît du site jusqu'à la nouvelle signature.
 * La ligne est rejetée plutôt que remise à zéro : sans décision, un score
 * Instagram retenu automatiquement redeviendrait visible.
 */
export async function unpublishSheet(db: SupabaseClient, matchKey: string) {
  check(
    await db
      .from("social_matches")
      .update({
        review: "rejected",
        reason: REOPENED_REASON,
        review_score_home: null,
        review_score_away: null,
        forfeit: null,
        reviewed_at: null,
      })
      .eq("match_key", matchKey)
      .eq("source", "delegate")
  );
}
