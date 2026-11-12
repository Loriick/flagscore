/**
 * Génère src/data/fake-data.json : des données de démonstration pour voir le
 * site sans la FFFA ni Supabase (NEXT_PUBLIC_FAKE_DATA=1).
 *
 * - Équipes et poules : les vraies (visuels FFFA 2026-2027).
 * - Scores : fictifs, tirés d'un générateur déterministe, SAUF la J2 des
 *   poules IDF Nord, IDF Nord Est et IDF Nord Ouest du championnat, reprise
 *   des posts Instagram de Flash de La Courneuve et des Molosses d'Asnières.
 *
 * Usage (depuis apps/web) : npx tsx scripts/generate-fake-data.ts
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { CDF_POOLS_2026_2027 } from "../src/lib/social/data/cdf-2026-2027";
import {
  POOLS_2026_2027,
  type PoolDefinition,
} from "../src/lib/social/data/pools-2026-2027";

// Générateur pseudo-aléatoire déterministe (mulberry32)
let seed = 20262027;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Un score de flag plausible : des touchdowns (6) et leurs transformations. */
function flagScore(strength: number) {
  const tds = Math.max(0, Math.round(rand() * 5 * strength + rand() * 2));
  let pts = 0;
  for (let i = 0; i < tds; i++) pts += 6 + (rand() < 0.45 ? 1 : rand() < 0.3 ? 2 : 0);
  return pts;
}

// Vrais scores (posts du 7-8 novembre 2026), au format [équipe 1, équipe 2, s1, s2].
const REAL_Q_J2: Record<string, Array<[string, string, number, number]>> = {
  "IDF Nord": [
    ["Flash A", "Cougars C", 0, 43],
    ["Flash A", "Molosses C", 0, 39],
    ["Flash A", "Gavroches", 7, 42],
  ],
  "IDF Nord Est": [
    ["Flash B", "Diables Rouges A", 7, 48],
    ["Flash B", "Homies A", 26, 21],
    ["Flash B", "Marne Soldiers", 18, 0],
  ],
  "IDF Nord Ouest": [
    ["Molosses B", "Nighthawks", 18, 0],
    ["Molosses B", "Asgards", 18, 0],
    ["Molosses B", "Lycans", 40, 25],
  ],
};

interface Row {
  [k: string]: unknown;
}

const championships: Row[] = [];
const pools: Row[] = [];
const days: Row[] = [];
const matches: Row[] = [];
const rankings: Row[] = [];
const teams: Row[] = [];

const COMPETITIONS: Array<{
  id: number;
  name: string;
  defs: PoolDefinition[];
  days: Array<{ name: string; date: string }>;
}> = [
  {
    id: 1,
    name: "Championnat de France mixte - Qualification",
    defs: POOLS_2026_2027,
    days: [
      { name: "Qualification J1", date: "2026-10-17" },
      { name: "Qualification J2", date: "2026-11-07" },
      { name: "Qualification J3", date: "2026-12-05" },
    ],
  },
  {
    id: 2,
    name: "Coupe de France masculine - Qualification",
    defs: CDF_POOLS_2026_2027.filter(p => p.category === "Masculin"),
    days: [
      { name: "Qualification J1", date: "2026-11-01" },
      { name: "Qualification J2", date: "2026-11-21" },
    ],
  },
  {
    id: 3,
    name: "Coupe de France féminine - Qualification",
    defs: CDF_POOLS_2026_2027.filter(p => p.category === "Féminin"),
    days: [
      { name: "Qualification J1", date: "2026-11-01" },
      { name: "Qualification J2", date: "2026-11-21" },
    ],
  },
];

// Date de référence de la démo : les journées passées ont un score.
const TODAY = "2026-11-12";
let poolId = 100;
let dayId = 1000;

for (const comp of COMPETITIONS) {
  championships.push({ id: comp.id, name: comp.name, season: "2026" });

  for (const def of comp.defs) {
    poolId++;
    const label = `${def.conference} · ${def.pool}`;
    pools.push({ id: poolId, championship_id: comp.id, name: label });
    const names = def.teams.map(([n]) => n);
    // Force propre à chaque équipe, pour des classements crédibles.
    const strength = new Map(names.map(n => [n, 0.35 + rand() * 0.9]));
    def.teams.forEach(([n, city]) =>
      teams.push({ name: n, city, pool_id: poolId, championship_id: comp.id })
    );

    const table = new Map(
      names.map(n => [n, { j: 0, g: 0, n: 0, p: 0, pf: 0, pa: 0 }])
    );

    for (const d of comp.days) {
      dayId++;
      days.push({ id: dayId, pool_id: poolId, name: d.name, date: d.date });
      const played = d.date <= TODAY;
      const real =
        comp.id === 1 && d.name === "Qualification J2"
          ? REAL_Q_J2[def.pool] ?? []
          : [];

      for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) {
          const [a, b] = rand() < 0.5 ? [names[i], names[j]] : [names[j], names[i]];
          let sa: number | null = null;
          let sb: number | null = null;
          if (played) {
            const r = real.find(
              ([x, y]) => (x === a && y === b) || (x === b && y === a)
            );
            if (r) {
              [sa, sb] = r[0] === a ? [r[2], r[3]] : [r[3], r[2]];
            } else {
              sa = flagScore(strength.get(a)!);
              sb = flagScore(strength.get(b)!);
            }
            const ta = table.get(a)!;
            const tb = table.get(b)!;
            ta.j++;
            tb.j++;
            ta.pf += sa;
            ta.pa += sb;
            tb.pf += sb;
            tb.pa += sa;
            if (sa > sb) {
              ta.g++;
              tb.p++;
            } else if (sb > sa) {
              tb.g++;
              ta.p++;
            } else {
              ta.n++;
              tb.n++;
            }
          }
          matches.push({
            id: `${dayId}_${a}_${b}`.replace(/\s+/g, "_"),
            pool_id: poolId,
            team_home: a,
            team_away: b,
            score_home: sa,
            score_away: sb,
            match_date: d.date,
            status: played ? "finished" : "scheduled",
          });
        }
      }
    }

    // Classement : victoire 3 pts, nul 1, défaite 0 ; départage à la différence.
    [...table.entries()]
      .map(([team, t]) => ({ team, ...t, pts: t.g * 3 + t.n, diff: t.pf - t.pa }))
      .sort((x, y) => y.pts - x.pts || y.diff - x.diff || y.pf - x.pf)
      .forEach((t, idx) =>
        rankings.push({
          id: `${poolId}_${idx + 1}`,
          pool_id: poolId,
          team_name: t.team,
          position: idx + 1,
          points: t.pts,
          played: t.j,
          won: t.g,
          drawn: t.n,
          lost: t.p,
          goals_for: t.pf,
          goals_against: t.pa,
          goal_difference: t.diff,
        })
      );
  }
}

const out = {
  _notice:
    "Données de démonstration générées par scripts/generate-fake-data.ts. Équipes et poules réelles (FFFA 2026-2027). Scores fictifs, sauf la J2 des poules IDF Nord, IDF Nord Est et IDF Nord Ouest du championnat, reprise des posts des clubs.",
  today: TODAY,
  championships,
  pools,
  days,
  matches,
  rankings,
  teams,
};

const file = join(process.cwd(), "src/data/fake-data.json");
writeFileSync(file, JSON.stringify(out, null, 1) + "\n");
console.log(
  `${file} : ${championships.length} compétitions, ${pools.length} poules, ${days.length} journées, ${matches.length} matchs`
);
