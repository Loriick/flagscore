/**
 * Résultats affichés sur le site à partir des scores relevés sur Instagram
 * (table `social_matches`), rangés selon les poules et le calendrier de la
 * saison 2026-2027.
 *
 * Scores affichés (voir `publishedRows`) :
 *  - ceux retenus automatiquement (`auto_apply`) : confirmés par les deux
 *    clubs, ou publiés par un seul club et rapprochés sans doute possible ;
 *  - ceux validés à la main sur la page Scores de l'admin, avec la correction éventuelle.
 * Les scores rejetés, à vérifier ou en conflit restent cachés.
 */

import { SEASON_2026_2027, type Competition } from "./calendar";
import type { PoolDefinition } from "./data/pools-2026-2027";
import { ALL_POOLS_2026_2027, poolTeamRef } from "./season";

import type { Championship, Day, Match, Pool, Ranking } from "../types";

/** Ligne de `social_matches` utile à l'affichage. */
export interface SocialMatchRow {
  match_key: string;
  event_key: string;
  team_home: string;
  team_away: string;
  /** null pour un forfait (aucun score conventionnel n'est inventé). */
  score_home: number | null;
  score_away: number | null;
  status: string;
  accounts: string[] | null;
  auto_apply?: boolean;
  review?: "approved" | "rejected" | null;
  review_score_home?: number | null;
  review_score_away?: number | null;
  source?: "instagram" | "manual" | "delegate";
  forfeit?: "home" | "away" | null;
}

/** Colonnes à lire pour l'affichage. */
export const SOCIAL_MATCH_COLUMNS =
  "match_key, event_key, team_home, team_away, score_home, score_away, status, accounts, auto_apply, review, review_score_home, review_score_away, source, forfeit";

/**
 * Filtre Supabase (`.or(...)`) des lignes publiables : retenues
 * automatiquement et pas rejetées, ou validées à la main.
 */
export const PUBLISHED_FILTER =
  "and(auto_apply.eq.true,review.is.null),review.eq.approved";

/**
 * Lignes à afficher, avec la correction manuelle appliquée. Un forfait n'a
 * aucun score : ni inventé, ni repris d'Instagram.
 */
export function publishedRows(rows: SocialMatchRow[]): SocialMatchRow[] {
  return rows.flatMap(row => {
    if (row.review === "rejected") return [];
    if (row.review !== "approved" && row.auto_apply === false) return [];
    if (row.forfeit) return [{ ...row, score_home: null, score_away: null }];
    return [
      {
        ...row,
        score_home: row.review_score_home ?? row.score_home,
        score_away: row.review_score_away ?? row.score_away,
      },
    ];
  });
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

/** Équipes d'une poule : nom de référence et nom affiché. */
export function socialPoolTeams(pid: number) {
  const pool = findPool(pid);
  if (!pool) return [];
  return [...poolTeamRefs(pool.def)].map(ref => ({
    ref,
    label: displayTeamName(ref),
  }));
}

/** Journées de qualification d'une poule, avec leur clé `event_key`. */
export function poolEvents(pid: number) {
  const pool = findPool(pid);
  if (!pool) return [];
  return qualificationEvents(pool.champ.competition).map(e => ({
    key: eventKey(e),
    ...e,
  }));
}

/**
 * Identité d'un match de la poule : clé `match_key` et orientation du
 * pipeline (ordre alphabétique des noms de référence). Partagée par la
 * saisie à la main et les feuilles de match, pour retomber sur la même ligne
 * que celle qu'un post Instagram produirait.
 * Renvoie null si la journée ou les équipes ne sont pas celles de la poule.
 */
export function poolMatch(input: {
  poolId: number;
  eventKey: string;
  teamA: string;
  teamB: string;
}) {
  const pool = findPool(input.poolId);
  if (!pool || input.teamA === input.teamB) return null;
  const teams = poolTeamRefs(pool.def);
  if (!teams.has(input.teamA) || !teams.has(input.teamB)) return null;
  const event = qualificationEvents(pool.champ.competition).find(
    e => eventKey(e) === input.eventKey
  );
  if (!event) return null;

  const aIsHome = [input.teamA, input.teamB].sort()[0] === input.teamA;
  const [home, away] = aIsHome
    ? [input.teamA, input.teamB]
    : [input.teamB, input.teamA];
  return {
    aIsHome,
    row: {
      match_key: `${eventKey(event)}|${home}|${away}`,
      event_key: eventKey(event),
      competition: event.competition,
      stage: event.stage,
      event_start: event.start,
      event_end: event.end,
      team_home: home,
      team_away: away,
    },
  };
}

/**
 * Ligne `social_matches` pour un match saisi à la main sur la page Scores de
 * l'admin (score connu par un autre moyen qu'Instagram). Même clé que celle du
 * pipeline : si un post publie ce match plus tard, il complète la même ligne
 * sans écraser la saisie (stockée comme une décision humaine).
 * Renvoie null si la poule, la journée ou les équipes ne correspondent pas.
 */
export function manualMatchRow(input: {
  poolId: number;
  dayId: number;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
}) {
  const event = poolEvents(input.poolId).find(
    e => dayId(e.start) === input.dayId
  );
  if (!event) return null;
  const match = poolMatch({ ...input, eventKey: event.key });
  if (!match) return null;
  const [scoreHome, scoreAway] = match.aIsHome
    ? [input.scoreA, input.scoreB]
    : [input.scoreB, input.scoreA];

  return {
    ...match.row,
    score_home: scoreHome,
    score_away: scoreAway,
    status: "single_source",
    auto_apply: false,
    source: "manual",
    review: "approved",
    review_score_home: scoreHome,
    review_score_away: scoreAway,
    reason: "Saisi à la main",
    accounts: [] as string[],
    observation_ids: [] as string[],
  };
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

/** Score venu d'une feuille de match signée par les deux équipes. */
const isSignedSheet = (row: SocialMatchRow) =>
  row.source === "delegate" && row.review === "approved";

export function socialMatches(
  rows: SocialMatchRow[],
  pid: number,
  did: number
): Match[] {
  return poolRows(rows, pid)
    .filter(({ event }) => dayId(event.start) === did)
    .map(({ row, event }, i) => {
      const signed = isSignedSheet(row);
      return {
        id: i + 1,
        championship_id: Math.floor(pid / 100),
        phase_id: 1,
        pool_id: pid,
        day_id: did,
        date: event.start,
        team_a: {
          name: displayTeamName(row.team_home),
          score: row.score_home,
          general_forfeit: row.forfeit === "home",
        },
        team_b: {
          name: displayTeamName(row.team_away),
          score: row.score_away,
          general_forfeit: row.forfeit === "away",
        },
        sheet: null,
        sources: signed ? [] : (row.accounts ?? []),
        signed,
      };
    });
}

/**
 * Classement de la poule : victoire 3 points, nul 1, défaite 0, puis
 * différence de points marqués et encaissés.
 *
 * En championnat, le 1er de chaque poule de qualification va en D1 et le 2e
 * en D2 (indiqué dès qu'il a joué au moins un match).
 * Les équipes sans score connu apparaissent avec 0 match. Un forfait compte
 * comme une victoire et une défaite, sans points marqués ni encaissés.
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
  const record = (
    team: string,
    scored: number,
    conceded: number,
    forced?: "win" | "loss"
  ) => {
    const s = stats.get(team)!;
    s.j += 1;
    s.won += scored;
    s.loss += conceded;
    if (forced === "win" || (!forced && scored > conceded)) {
      s.g += 1;
      s.total += 3;
    } else if (!forced && scored === conceded) {
      s.n += 1;
      s.total += 1;
    } else {
      s.p += 1;
    }
  };
  for (const { row } of poolRows(rows, pid)) {
    if (row.forfeit) {
      const loser = row.forfeit === "home" ? row.team_home : row.team_away;
      const winner = row.forfeit === "home" ? row.team_away : row.team_home;
      record(winner, 0, 0, "win");
      record(loser, 0, 0, "loss");
    } else if (row.score_home !== null && row.score_away !== null) {
      record(row.team_home, row.score_home, row.score_away);
      record(row.team_away, row.score_away, row.score_home);
    }
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
