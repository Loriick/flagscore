/**
 * Résultats affichés sur le site à partir des scores relevés sur Instagram
 * (table `social_matches`), rangés selon les poules et le calendrier de la
 * saison 2026-2027.
 *
 * Seuls les scores retenus automatiquement (`auto_apply`) sont affichés :
 * confirmés par les deux clubs, ou publiés par un seul club et rapprochés
 * sans doute possible. Les scores à vérifier et les conflits restent cachés.
 */

import { SEASON_2026_2027, type Competition } from "./calendar";
import type { PoolDefinition } from "./data/pools-2026-2027";
import { ALL_POOLS_2026_2027, poolTeamRef } from "./season";

import type { Championship, Day, Match, Pool, Ranking } from "@/app/types";

/** Ligne de `social_matches` utile à l'affichage. */
export interface SocialMatchRow {
  match_key: string;
  event_key: string;
  team_home: string;
  team_away: string;
  score_home: number;
  score_away: number;
  status: string;
  accounts: string[] | null;
}

export const SOCIAL_SEASON = 2026;

/** Division visée selon la place en poule de qualification du championnat. */
const CM_QUALIFICATIONS = ["D1", "D2"];

interface SocialChampionship extends Championship {
  competition: Competition;
  category: NonNullable<PoolDefinition["category"]>;
}

export const SOCIAL_CHAMPIONSHIPS: SocialChampionship[] = [
  {
    id: 1,
    label: "Championnat de France mixte",
    season: SOCIAL_SEASON,
    male: false,
    competition: "CM",
    category: "Mixte",
  },
  {
    id: 2,
    label: "Coupe de France masculine",
    season: SOCIAL_SEASON,
    male: true,
    competition: "CDF",
    category: "Masculin",
  },
  {
    id: 3,
    label: "Coupe de France féminine",
    season: SOCIAL_SEASON,
    male: true,
    competition: "CDF",
    category: "Féminin",
  },
];

const championshipOf = (id: number) =>
  SOCIAL_CHAMPIONSHIPS.find(c => c.id === id);

/** Poules d'une compétition, dans l'ordre des visuels officiels. */
function poolDefinitions(championshipId: number): PoolDefinition[] {
  const champ = championshipOf(championshipId);
  if (!champ) return [];
  return ALL_POOLS_2026_2027.filter(
    p =>
      (p.competition ?? "CM") === champ.competition &&
      (p.category ?? "Mixte") === champ.category
  );
}

/** Identifiant stable dans l'URL : 101, 102… pour le championnat. */
const poolId = (championshipId: number, index: number) =>
  championshipId * 100 + index + 1;

function poolLabel(def: PoolDefinition): string {
  // « Masc. Nord - Poule 3 » → « Nord - Poule 3 » (la catégorie est déjà
  // dans le nom de la compétition).
  const name = def.pool.replace(/^(Masc\.|Fém\.)\s+/, "");
  return name.startsWith(def.conference) ? name : `${def.conference} - ${name}`;
}

export function socialPools(championshipId: number): Pool[] {
  return poolDefinitions(championshipId).map((def, i) => ({
    id: poolId(championshipId, i),
    championship_id: championshipId,
    phase_id: 1,
    label: poolLabel(def),
  }));
}

function findPool(pid: number) {
  const championshipId = Math.floor(pid / 100);
  const def = poolDefinitions(championshipId)[(pid % 100) - 1];
  const champ = championshipOf(championshipId);
  return def && champ ? { def, champ } : null;
}

/**
 * Journées de qualification d'une compétition. En Coupe de France, les
 * matchs du 31 octobre (« Qualif. ») sont rangés avec la Q - J1 du
 * 1er novembre : la collecte les rattache au même week-end.
 */
function qualificationEvents(competition: Competition) {
  return SEASON_2026_2027.filter(
    e => e.competition === competition && e.stage.startsWith("Q - ")
  );
}

const eventKey = (e: { competition: string; stage: string; start: string }) =>
  `${e.competition}|${e.stage}|${e.start}`;

/** Identifiant d'une journée : sa date, ex. 20261107. */
const dayId = (date: string) => Number(date.replace(/-/g, ""));

export function socialDays(pid: number): Day[] {
  const pool = findPool(pid);
  if (!pool) return [];
  return qualificationEvents(pool.champ.competition).map((e, i) => ({
    id: dayId(e.start),
    championship_id: pool.champ.id,
    phase_id: 1,
    pool_id: pid,
    label: `Journée ${e.stage.replace("Q - J", "")}`,
    date: e.start,
    number: i + 1,
  }));
}

/** « Molosses B (Asnières) · Fém. » → « Molosses B ». */
export function displayTeamName(ref: string): string {
  return ref.replace(/\s+·\s+(Masc|Fém)\.$/, "").replace(/\s+\([^)]*\)$/, "");
}

function poolTeamRefs(def: PoolDefinition): Set<string> {
  return new Set(def.teams.map(([name, city]) => poolTeamRef(def, name, city)));
}

/** Scores de la poule, toutes journées, avec leur journée. */
function poolRows(rows: SocialMatchRow[], pid: number) {
  const pool = findPool(pid);
  if (!pool) return [];
  const teams = poolTeamRefs(pool.def);
  const days = new Map(
    qualificationEvents(pool.champ.competition).map(e => [eventKey(e), e])
  );
  return rows.flatMap(row => {
    const event = days.get(row.event_key);
    return event && teams.has(row.team_home) && teams.has(row.team_away)
      ? [{ row, event }]
      : [];
  });
}

export function socialMatches(
  rows: SocialMatchRow[],
  pid: number,
  did: number
): Match[] {
  return poolRows(rows, pid)
    .filter(({ event }) => dayId(event.start) === did)
    .map(({ row, event }, i) => ({
      id: i + 1,
      championship_id: Math.floor(pid / 100),
      phase_id: 1,
      pool_id: pid,
      day_id: did,
      date: event.start,
      team_a: {
        name: displayTeamName(row.team_home),
        score: row.score_home,
        general_forfeit: false,
      },
      team_b: {
        name: displayTeamName(row.team_away),
        score: row.score_away,
        general_forfeit: false,
      },
      sheet: null,
      sources: row.accounts ?? [],
    }));
}

/**
 * Classement de la poule : victoire 3 points, nul 1, défaite 0, puis
 * différence de points marqués et encaissés.
 *
 * En championnat, le 1er de chaque poule de qualification va en D1 et le 2e
 * en D2 (indiqué dès qu'il a joué au moins un match).
 * Les équipes sans score connu apparaissent avec 0 match.
 */
export function socialRankings(rows: SocialMatchRow[], pid: number): Ranking[] {
  const pool = findPool(pid);
  if (!pool) return [];

  const stats = new Map(
    [...poolTeamRefs(pool.def)].map(ref => [
      ref,
      { j: 0, g: 0, n: 0, p: 0, total: 0, won: 0, loss: 0 },
    ])
  );
  const record = (team: string, scored: number, conceded: number) => {
    const s = stats.get(team)!;
    s.j += 1;
    s.won += scored;
    s.loss += conceded;
    if (scored > conceded) {
      s.g += 1;
      s.total += 3;
    } else if (scored === conceded) {
      s.n += 1;
      s.total += 1;
    } else {
      s.p += 1;
    }
  };
  for (const { row } of poolRows(rows, pid)) {
    record(row.team_home, row.score_home, row.score_away);
    record(row.team_away, row.score_away, row.score_home);
  }

  return [...stats.entries()]
    .map(([ref, s], i) => ({
      position: 0,
      club: { id: i + 1, label: displayTeamName(ref), general_forfeit: false },
      points: s.total,
      j: s.j,
      g: s.g,
      n: s.n,
      p: s.p,
      points_won: s.won,
      points_loss: s.loss,
      points_diff: s.won - s.loss,
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.points_diff - a.points_diff ||
        b.j - a.j ||
        a.club.label.localeCompare(b.club.label, "fr")
    )
    .map((r, i) => {
      const qualification =
        pool.champ.competition === "CM" && r.j > 0
          ? CM_QUALIFICATIONS[i]
          : undefined;
      return {
        ...r,
        position: i + 1,
        ...(qualification ? { qualification } : {}),
      };
    });
}
