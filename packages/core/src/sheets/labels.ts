import {
  displayTeamName,
  poolEvents,
  SOCIAL_CHAMPIONSHIPS,
  socialPools,
  socialPoolTeams,
} from "../social/results";

import type { Side, SignerRole } from "./machine";

/** Libellés d'un plateau pour l'interface : compétition, poule, journée, équipes. */
export function describePlateau(plateau: {
  pool_id: number;
  event_key: string;
}) {
  const championshipId = Math.floor(plateau.pool_id / 100);
  const championship = SOCIAL_CHAMPIONSHIPS.find(c => c.id === championshipId);
  const pool = socialPools(championshipId).find(p => p.id === plateau.pool_id);
  const event = poolEvents(plateau.pool_id).find(
    e => e.key === plateau.event_key
  );
  return {
    competition: championship?.label ?? "Compétition inconnue",
    pool: pool?.label ?? `Poule ${plateau.pool_id}`,
    stage: event?.stage ?? plateau.event_key,
    teams: socialPoolTeams(plateau.pool_id),
  };
}

export const teamLabel = displayTeamName;

export function formatDay(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  });
}

/** Nom de l'app des délégués, affiché après « Flagscore ». */
export const MATCHS_APP_NAME = "Matchs";

export const ROLE_LABEL: Record<SignerRole, string> = {
  coach: "Coach",
  captain: "Capitaine",
};

/** « 21 – 14 », « Forfait de Ankou », ou null si rien n'est saisi. */
export function resultLabel(sheet: {
  team_home: string;
  team_away: string;
  score_home: number | null;
  score_away: number | null;
  forfeit: Side | null;
}): string | null {
  if (sheet.forfeit) {
    const team = sheet.forfeit === "home" ? sheet.team_home : sheet.team_away;
    return `Forfait de ${teamLabel(team)}`;
  }
  if (sheet.score_home === null || sheet.score_away === null) return null;
  return `${sheet.score_home} – ${sheet.score_away}`;
}
