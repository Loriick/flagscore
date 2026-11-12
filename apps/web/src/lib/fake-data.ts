/**
 * Mode démo : NEXT_PUBLIC_FAKE_DATA=1 remplace Supabase et la FFFA par
 * src/data/fake-data.json (généré par scripts/generate-fake-data.ts).
 *
 * Le JSON n'est chargé qu'en mode démo (import dynamique), il ne pèse rien
 * sur le site normal.
 */

export const FAKE_DATA = process.env.NEXT_PUBLIC_FAKE_DATA === "1";

interface FakeChampionship {
  id: number;
  name: string;
  season: string;
}
interface FakePool {
  id: number;
  championship_id: number;
  name: string;
}
interface FakeDay {
  id: number;
  pool_id: number;
  name: string;
  date: string;
}
interface FakeMatch {
  id: string;
  pool_id: number;
  team_home: string;
  team_away: string;
  score_home: number | null;
  score_away: number | null;
  match_date: string;
  status: string;
}
interface FakeRanking {
  id: string;
  pool_id: number;
  team_name: string;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
}
interface FakeData {
  championships: FakeChampionship[];
  pools: FakePool[];
  days: FakeDay[];
  matches: FakeMatch[];
  rankings: FakeRanking[];
}

let cache: Promise<FakeData> | null = null;
function load(): Promise<FakeData> {
  cache ??= import("@/data/fake-data.json").then(
    m => (m.default ?? m) as unknown as FakeData
  );
  return cache;
}

const stamp = <T extends object>(rows: T[]) =>
  rows.map(r => ({
    ...r,
    created_at: "2026-11-12T00:00:00Z",
    updated_at: "2026-11-12T00:00:00Z",
  }));

export const fake = {
  async championships(season?: number) {
    const d = await load();
    return stamp(
      d.championships.filter(c => !season || c.season === season.toString())
    );
  },
  async championshipById(id: number) {
    return (await this.championships()).find(c => c.id === id) ?? null;
  },
  async poolsByChampionship(championshipId: number) {
    const d = await load();
    return stamp(d.pools.filter(p => p.championship_id === championshipId));
  },
  async poolById(poolId: number) {
    const d = await load();
    return stamp(d.pools.filter(p => p.id === poolId))[0] ?? null;
  },
  async daysByPool(poolId: number) {
    const d = await load();
    return stamp(d.days.filter(x => x.pool_id === poolId));
  },
  async dayById(id: number) {
    const d = await load();
    return stamp(d.days.filter(x => x.id === id))[0] ?? null;
  },
  async matchesByPool(poolId: number) {
    const d = await load();
    return stamp(d.matches.filter(m => m.pool_id === poolId));
  },
  async matchesByDate(date: string) {
    const d = await load();
    return stamp(d.matches.filter(m => m.match_date === date));
  },
  async rankingsByPool(poolId: number) {
    const d = await load();
    return stamp(d.rankings.filter(r => r.pool_id === poolId));
  },
};
