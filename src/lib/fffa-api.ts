export type Championship = {
  id: number;
  label: string;
  season: number;
  male: boolean;
};

export type Phase = {
  id: number;
  championship_id: number;
  label: string;
};

export type Pool = {
  id: number;
  championship_id: number;
  phase_id: number;
  label: string;
};

export type Day = {
  id: number;
  championship_id: number;
  phase_id: number;
  pool_id: number;
  label: string;
  date: string;
  number: number;
};

export type Match = {
  id: number;
  championship_id: number;
  phase_id: number;
  pool_id: number;
  day_id: number;
  date: string;
  team_a: { name: string; score: number; general_forfeit: boolean };
  team_b: { name: string; score: number; general_forfeit: boolean };
  sheet: string | null;
};

export type Ranking = {
  position: number;
  club: { id: number; label: string; general_forfeit: boolean };
  cf: number;
  j: number;
  g: number;
  n: number;
  p: number;
  points: number;
  points_won: number;
  points_loss: number;
  points_diff: number;
  penalties: number;
  f: number;
};

async function api<T>(params: Record<string, string | string[]>): Promise<T> {
  const url = new URL(
    "/api/fffa/flag",
    process.env.NEXT_PUBLIC_FLAGSCORE_ORIGIN ?? "http://localhost:3000"
  );
  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach(val => url.searchParams.append(k, val));
    else url.searchParams.append(k, v);
  });

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`FFFA API error ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const txt = await res.text();
    throw new Error(`FFFA API non-JSON: ${txt.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// ---- API ----
export async function getSeasons() {
  return api<number[]>({ resource: "seasons" });
}

export async function getChampionships(season: number) {
  const allChampionships = await api<Championship[]>({
    resource: "championships",
    "args[]": season.toString(),
  });

  const allowedNames = ["Championnat de France mixte", "Coupe de France"];
  const filteredChampionships = allChampionships.filter(championship =>
    allowedNames.some(name => championship.label.includes(name))
  );

  // Garder la Qualification en priorité, sinon D1, sinon la première occurrence de "Championnat de France mixte"
  const mixteChampionship =
    filteredChampionships.find(championship =>
      championship.label.includes("Championnat de France mixte - Qualification")
    ) ||
    filteredChampionships.find(championship =>
      championship.label.includes("Championnat de France mixte - D1")
    ) ||
    filteredChampionships.find(championship =>
      championship.label.includes("Championnat de France mixte")
    );

  const coupeChampionships = filteredChampionships.filter(championship =>
    championship.label.includes("Coupe de France")
  );

  // Retourner la première occurrence de mixte + toutes les coupes
  const result = [];
  if (mixteChampionship) result.push(mixteChampionship);
  result.push(...coupeChampionships);

  return result;
}

export async function getPhases(championshipId: number) {
  return api<Phase[]>({
    resource: "phases",
    "args[]": championshipId.toString(),
  });
}

export async function getPools(phaseId: number) {
  return api<Pool[]>({ resource: "pools", "args[]": phaseId.toString() });
}

export async function getDays(poolId: number) {
  return api<Day[]>({ resource: "days", "args[]": poolId.toString() });
}

export async function getMatches(dayId: number) {
  return api<Match[]>({ resource: "matches", "args[]": dayId.toString() });
}

export async function getRankings(poolId: number) {
  return api<Ranking[]>({ resource: "rankings", "args[]": poolId.toString() });
}
