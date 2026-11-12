/**
 * Annuaire des équipes de la saison 2026-2027, construit à partir des poules
 * officielles et des comptes Instagram connus des clubs.
 */

import {
  CLUB_INSTAGRAM,
  clubName,
  POOLS_2026_2027,
  teamRef,
  type PoolDefinition,
} from "./data/pools-2026-2027";
import { TeamDirectory } from "./teams";

export function buildSeasonDirectory({
  pools = POOLS_2026_2027,
  instagram = CLUB_INSTAGRAM,
  aliases = [],
}: {
  pools?: PoolDefinition[];
  instagram?: Record<string, string[]>;
  /** Alias validés (ex. table `team_aliases`). */
  aliases?: Array<{ alias: string; team: string }>;
} = {}): TeamDirectory {
  const clubTeams = new Map<string, string[]>();
  const poolList = pools.map(p => {
    const teams = p.teams.map(([name, city]) => {
      const ref = teamRef(name, city);
      const club = teamRef(clubName(name), city);
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

/** Liste des clubs (une entrée par club, toutes équipes confondues). */
export function listClubs(pools = POOLS_2026_2027) {
  const clubs = new Map<string, { club: string; teams: string[] }>();
  for (const p of pools) {
    for (const [name, city] of p.teams) {
      const club = teamRef(clubName(name), city);
      const entry = clubs.get(club) ?? { club, teams: [] };
      entry.teams.push(teamRef(name, city));
      clubs.set(club, entry);
    }
  }
  return [...clubs.values()];
}
