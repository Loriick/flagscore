/**
 * Annuaires des équipes de la saison 2026-2027, un par compétition :
 *  - CM  : Championnat de France (mixte)
 *  - CDF : Coupe de France (masculins + féminines)
 *
 * Une même « Molosses A » est une équipe différente dans chaque compétition et
 * catégorie. En Coupe de France, la catégorie est donc ajoutée au nom de
 * référence (« Molosses A (Asnières) · Fém. ») ; les poules tranchent entre
 * masculin et féminin.
 */

import type { Competition, CompetitionEvent } from "./calendar";
import { CDF_POOLS_2026_2027 } from "./data/cdf-2026-2027";
import {
  CLUB_INSTAGRAM,
  clubName,
  POOLS_2026_2027,
  teamRef,
  type PoolDefinition,
} from "./data/pools-2026-2027";
import { TeamDirectory } from "./teams";

export const ALL_POOLS_2026_2027: PoolDefinition[] = [
  ...POOLS_2026_2027,
  ...CDF_POOLS_2026_2027,
];

const CATEGORY_SUFFIX = {
  Mixte: "",
  Masculin: " · Masc.",
  Féminin: " · Fém.",
} as const;

const competitionOf = (p: PoolDefinition): Competition => p.competition ?? "CM";

/** Nom de référence d'une équipe dans une poule donnée. */
export function poolTeamRef(
  pool: PoolDefinition,
  name: string,
  city: string
): string {
  return teamRef(name, city) + CATEGORY_SUFFIX[pool.category ?? "Mixte"];
}

const clubKey = (name: string, city: string) => teamRef(clubName(name), city);

export interface DirectoryOptions {
  pools?: PoolDefinition[];
  instagram?: Record<string, string[]>;
  /** Alias validés (ex. table `team_aliases`). */
  aliases?: Array<{ alias: string; team: string }>;
}

export function buildSeasonDirectory(
  competition: Competition = "CM",
  {
    pools = ALL_POOLS_2026_2027,
    instagram = CLUB_INSTAGRAM,
    aliases = [],
  }: DirectoryOptions = {}
): TeamDirectory {
  const clubTeams = new Map<string, string[]>();
  const poolList = pools
    .filter(p => competitionOf(p) === competition)
    .map(p => {
      const teams = p.teams.map(([name, city]) => {
        const ref = poolTeamRef(p, name, city);
        const club = clubKey(name, city);
        clubTeams.set(club, [...(clubTeams.get(club) ?? []), ref]);
        return ref;
      });
      return { pool: `${p.conference} - ${p.pool}`, teams };
    });

  const clubAccounts = Object.entries(instagram).flatMap(([club, handles]) =>
    handles.map(handle => ({ handle, teams: clubTeams.get(club) ?? [] }))
  );

  return new TeamDirectory({
    teams: [],
    pools: poolList,
    clubAccounts,
    aliases,
  });
}

/** Un annuaire par compétition, et la fonction qui choisit selon la journée. */
export function buildSeasonDirectories(options: DirectoryOptions = {}) {
  const byCompetition: Record<Competition, TeamDirectory> = {
    CM: buildSeasonDirectory("CM", options),
    CDF: buildSeasonDirectory("CDF", options),
  };
  return {
    byCompetition,
    forEvent: (event: CompetitionEvent) => byCompetition[event.competition],
  };
}

/** Liste des clubs, toutes compétitions confondues. */
export function listClubs(pools = ALL_POOLS_2026_2027) {
  const clubs = new Map<string, { club: string; teams: string[] }>();
  for (const p of pools) {
    for (const [name, city] of p.teams) {
      const club = clubKey(name, city);
      const entry = clubs.get(club) ?? { club, teams: [] };
      entry.teams.push(poolTeamRef(p, name, city));
      clubs.set(club, entry);
    }
  }
  return [...clubs.values()];
}
