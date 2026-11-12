/**
 * Rapprochement : relie chaque score lu sur un post à un match unique.
 *
 * Deux modes, choisis automatiquement :
 *  - Avec calendrier (des matchs de `matches` existent sur les dates de la
 *    journée) : on cherche le match prévu dont les deux équipes sont parmi les
 *    candidates. Le match obtenu a un id FFFA.
 *  - Sans calendrier : on forme la paire d'équipes de référence ; la clé du match
 *    est alors (compétition, journée, paire triée).
 *
 * Dans les deux cas, les ambiguïtés restantes sont levées par la règle du
 * plateau : en qualification, une équipe joue `plateauSize - 1` matchs par
 * journée. Une équipe dont on connaît déjà tous les adversaires du jour ne peut
 * pas être l'adversaire inconnu d'un autre post.
 *
 * Exemple réel : le post des Molosses montre « Red » contre Nighthawks, Asgards
 * et Lycans le 7 novembre. Le post de Flash A dit « contre Molosses » le même
 * week-end. Molosses Red a déjà ses 3 adversaires et Flash A n'en fait pas
 * partie : il s'agit donc d'une autre équipe des Molosses.
 */

import type { CompetitionEvent } from "./calendar";
import type { TeamDirectory } from "./teams";

export interface ScheduledMatch {
  id: string;
  team_home: string;
  team_away: string;
  /** YYYY-MM-DD */
  match_date: string;
  score_home: number | null;
  score_away: number | null;
  score_source?: string | null;
}

export interface Observation {
  /** Identifiant stable : `${postId}#${index}`. */
  id: string;
  postId: string;
  /** Compte Instagram qui a publié (le club de `team`). */
  account: string;
  event: CompetitionEvent;
  /** Équipe du club qui publie, telle qu'écrite sur le post. */
  team: string;
  /** Adversaire, tel qu'écrit sur le post. */
  opponent: string;
  teamScore: number;
  opponentScore: number;
  /** Confiance de l'extraction (0..1). */
  confidence: number;
}

export type ResolutionStatus = "resolved" | "ambiguous" | "unmatched";

export interface ResolvedObservation {
  observation: Observation;
  status: ResolutionStatus;
  /** Clé du match : id FFFA (mode calendrier) ou clé synthétique. */
  matchKey?: string;
  /** Présent en mode calendrier. */
  matchId?: string;
  /** Équipes de référence, orientées domicile / extérieur. */
  home?: string;
  away?: string;
  scoreHome?: number;
  scoreAway?: number;
  /** Paires encore possibles quand status === "ambiguous". */
  options?: Array<[string, string]>;
  /**
   * Vrai si l'adversaire n'a pas été reconnu par son nom mais déduit par
   * élimination dans la poule (ex. « Dragons » → seule équipe restante).
   * Le score ne doit alors pas être appliqué sans validation humaine.
   */
  inferred?: boolean;
}

export interface ResolveOptions {
  /** Matchs prévus (toutes dates confondues, filtrés ici par journée). */
  schedule?: ScheduledMatch[];
  /**
   * Nombre d'équipes par plateau quand la poule est inconnue. Si la poule est
   * connue, sa taille est utilisée.
   */
  plateauSize?: number;
}

export function eventKey(event: CompetitionEvent): string {
  return `${event.competition}|${event.stage}|${event.start}`;
}

export function syntheticMatchKey(
  event: CompetitionEvent,
  a: string,
  b: string
): string {
  const [x, y] = [a, b].sort();
  return `${eventKey(event)}|${x}|${y}`;
}

interface Pending {
  obs: Observation;
  teamCands: string[];
  oppCands: string[];
  /** Adversaire déduit de la poule faute d'avoir reconnu son nom. */
  inferred: boolean;
  result?: ResolvedObservation;
}

/**
 * Résout un lot d'observations. Il vaut mieux passer en une fois toutes les
 * observations connues (y compris celles déjà résolues lors des passages
 * précédents) : plus il y en a, plus la règle du plateau lève d'ambiguïtés.
 */
export function resolveObservations(
  observations: Observation[],
  directory: TeamDirectory,
  { schedule = [], plateauSize = 4 }: ResolveOptions = {}
): ResolvedObservation[] {
  const pending: Pending[] = observations.map(obs => {
    const teamCands = directory.candidates(obs.team, obs.account);
    let oppCands = directory.candidates(obs.opponent);
    let inferred = false;
    if (oppCands.length === 0) {
      // Nom inconnu ("Dragons") : l'adversaire est forcément dans la poule.
      oppCands = [...new Set(teamCands.flatMap(t => directory.poolMates(t)))];
      inferred = oppCands.length > 0;
    }
    return { obs, teamCands, oppCands, inferred };
  });

  // Paires déjà attribuées dans chaque post : un post n'annonce pas deux fois
  // le même match.
  const postPairs = new Map<string, Set<string>>();
  const pairKey = (a: string, b: string) => [a, b].sort().join("|");

  // Matchs prévus, regroupés par journée.
  const scheduleByEvent = new Map<string, ScheduledMatch[]>();
  for (const p of pending) {
    const key = eventKey(p.obs.event);
    if (!scheduleByEvent.has(key)) {
      scheduleByEvent.set(
        key,
        schedule.filter(
          m =>
            m.match_date >= p.obs.event.start && m.match_date <= p.obs.event.end
        )
      );
    }
  }

  // Adversaires connus de chaque équipe, par journée.
  const opponents = new Map<string, Set<string>>();
  const oppKey = (event: CompetitionEvent, team: string) =>
    `${eventKey(event)}|${team}`;
  const addOpponent = (event: CompetitionEvent, a: string, b: string) => {
    for (const [x, y] of [
      [a, b],
      [b, a],
    ]) {
      const k = oppKey(event, x);
      if (!opponents.has(k)) opponents.set(k, new Set());
      opponents.get(k)!.add(y);
    }
  };
  const saturatedWithout = (
    event: CompetitionEvent,
    team: string,
    other: string
  ) => {
    const opp = opponents.get(oppKey(event, team));
    const size = directory.poolOf(team)
      ? directory.poolMates(team).length + 1
      : plateauSize;
    return !!opp && opp.size >= size - 1 && !opp.has(other);
  };

  const optionsFor = (p: Pending): Array<[string, string]> => {
    const daySchedule = scheduleByEvent.get(eventKey(p.obs.event)) ?? [];
    const pairs: Array<[string, string]> = [];
    for (const a of p.teamCands) {
      for (const b of p.oppCands) {
        if (a === b) continue;
        if (!directory.canPlay(a, b)) continue;
        if (
          p.oppCands.length > 1 &&
          postPairs.get(p.obs.postId)?.has(pairKey(a, b))
        )
          continue;
        if (daySchedule.length > 0) {
          const scheduled = daySchedule.some(
            m =>
              (m.team_home === a && m.team_away === b) ||
              (m.team_home === b && m.team_away === a)
          );
          if (!scheduled) continue;
        }
        if (saturatedWithout(p.obs.event, a, b)) continue;
        if (saturatedWithout(p.obs.event, b, a)) continue;
        pairs.push([a, b]);
      }
    }
    return pairs;
  };

  const finalize = (p: Pending, team: string, opp: string) => {
    const { obs } = p;
    const daySchedule = scheduleByEvent.get(eventKey(obs.event)) ?? [];
    const match = daySchedule.find(
      m =>
        (m.team_home === team && m.team_away === opp) ||
        (m.team_home === opp && m.team_away === team)
    );

    // Orientation : celle du calendrier, sinon ordre alphabétique.
    const home = match ? match.team_home : [team, opp].sort()[0];
    const teamIsHome = home === team;
    p.result = {
      observation: obs,
      status: "resolved",
      matchKey: match ? match.id : syntheticMatchKey(obs.event, team, opp),
      matchId: match?.id,
      home,
      away: teamIsHome ? opp : team,
      scoreHome: teamIsHome ? obs.teamScore : obs.opponentScore,
      scoreAway: teamIsHome ? obs.opponentScore : obs.teamScore,
      ...(p.inferred ? { inferred: true } : {}),
    };
    addOpponent(obs.event, team, opp);
    if (!postPairs.has(obs.postId)) postPairs.set(obs.postId, new Set());
    postPairs.get(obs.postId)!.add(pairKey(team, opp));
  };

  // Passe 1 : ce qui est sans ambiguïté. Puis on recommence tant que la règle
  // du plateau permet d'en résoudre de nouveaux.
  let progress = true;
  while (progress) {
    progress = false;
    for (const p of pending) {
      if (p.result) continue;
      const opts = optionsFor(p);
      if (opts.length === 1) {
        finalize(p, opts[0][0], opts[0][1]);
        progress = true;
      }
    }
  }

  return pending.map(p => {
    if (p.result) return p.result;
    const opts = optionsFor(p);
    return {
      observation: p.obs,
      status: opts.length > 1 ? "ambiguous" : "unmatched",
      options: opts.length > 1 ? opts : undefined,
    };
  });
}
