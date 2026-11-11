/**
 * Recoupement : regroupe les observations résolues par match et décide quoi
 * faire du score.
 *
 *  - confirmed      : au moins deux comptes différents donnent le même score.
 *  - single_source  : un seul compte ; appliqué automatiquement si la confiance
 *                     d'extraction dépasse le seuil, sinon à valider.
 *  - conflict       : les sources ne sont pas d'accord → validation manuelle.
 *
 * Un score déjà fourni par la FFFA n'est jamais écrasé : s'il diffère, on
 * signale un conflit.
 */

import type { ResolvedObservation, ScheduledMatch } from "./resolve";

export type DecisionStatus = "confirmed" | "single_source" | "conflict";

export interface MatchDecision {
  matchKey: string;
  matchId?: string;
  home: string;
  away: string;
  status: DecisionStatus;
  /** Score retenu (absent en cas de conflit). */
  scoreHome?: number;
  scoreAway?: number;
  /** Comptes Instagram ayant publié ce match. */
  accounts: string[];
  observationIds: string[];
  /** Le score peut-il être écrit dans `matches` sans validation humaine ? */
  autoApply: boolean;
  reason: string;
}

export interface ReconcileOptions {
  /** Confiance minimale pour appliquer un score vu sur un seul compte. */
  singleSourceThreshold?: number;
  /** Matchs FFFA existants, pour ne pas écraser un score officiel. */
  schedule?: ScheduledMatch[];
}

export function reconcile(
  resolved: ResolvedObservation[],
  { singleSourceThreshold = 0.85, schedule = [] }: ReconcileOptions = {}
): MatchDecision[] {
  const groups = new Map<string, ResolvedObservation[]>();
  for (const r of resolved) {
    if (r.status !== "resolved" || !r.matchKey) continue;
    if (!groups.has(r.matchKey)) groups.set(r.matchKey, []);
    groups.get(r.matchKey)!.push(r);
  }

  const official = new Map(schedule.map(m => [m.id, m]));
  const decisions: MatchDecision[] = [];

  for (const [matchKey, items] of groups) {
    const first = items[0];
    const accounts = [...new Set(items.map(i => i.observation.account))];
    const scores = new Set(items.map(i => `${i.scoreHome}-${i.scoreAway}`));
    const base = {
      matchKey,
      matchId: first.matchId,
      home: first.home!,
      away: first.away!,
      accounts,
      observationIds: items.map(i => i.observation.id),
    };

    if (scores.size > 1) {
      decisions.push({
        ...base,
        status: "conflict",
        autoApply: false,
        reason: `Scores différents selon les posts : ${[...scores].join(", ")}`,
      });
      continue;
    }

    const scoreHome = first.scoreHome!;
    const scoreAway = first.scoreAway!;
    const status: DecisionStatus =
      accounts.length >= 2 ? "confirmed" : "single_source";
    const maxConfidence = Math.max(...items.map(i => i.observation.confidence));

    const autoApply =
      status === "confirmed" || maxConfidence >= singleSourceThreshold;
    const reason =
      status === "confirmed"
        ? `Confirmé par ${accounts.length} comptes`
        : autoApply
          ? `Source unique, confiance ${maxConfidence.toFixed(2)}`
          : `Source unique, confiance ${maxConfidence.toFixed(2)} < ${singleSourceThreshold}`;

    // Ne jamais écraser un score officiel FFFA.
    const existing = first.matchId ? official.get(first.matchId) : undefined;
    if (
      existing &&
      existing.score_source !== "social" &&
      existing.score_home !== null &&
      existing.score_away !== null
    ) {
      const same =
        existing.score_home === scoreHome && existing.score_away === scoreAway;
      decisions.push({
        ...base,
        status: same ? status : "conflict",
        scoreHome,
        scoreAway,
        autoApply: false,
        reason: same
          ? "Déjà renseigné par la FFFA (identique)"
          : `La FFFA indique ${existing.score_home}-${existing.score_away}`,
      });
      continue;
    }

    decisions.push({
      ...base,
      status,
      scoreHome,
      scoreAway,
      autoApply,
      reason,
    });
  }

  return decisions;
}
