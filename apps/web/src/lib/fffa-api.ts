// Import des types de base depuis le package shared
import type {
  Championship,
  Pool,
  Day,
  Match,
  Ranking as BaseRanking,
} from "@flagscore/shared";

// Type spécifique à l'API FFFA (Phase n'est pas dans les types shared)
export type Phase = {
  id: number;
  championship_id: number;
  label: string;
};

// Ré-export des types de base depuis shared
export type { Championship, Pool, Day, Match };

// Type Ranking étendu pour FFFA avec propriétés supplémentaires
export type Ranking = BaseRanking & {
  cf: number;
  penalties: number;
  f: number;
};

async function api<T>(params: Record<string, string | string[]>): Promise<T> {
  try {
    // Use relative URL for same-origin requests
    const baseUrl = process.env.NEXT_PUBLIC_FLAGSCORE_ORIGIN || "";
    const url = new URL(
      "/api/fffa/flag",
      baseUrl || (typeof window !== "undefined" ? window.location.origin : "")
    );

    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(val => url.searchParams.append(k, val));
      else url.searchParams.append(k, v);
    });

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`FFFA API error ${res.status}: ${res.statusText}`);
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const txt = await res.text();
      throw new Error(`FFFA API non-JSON: ${txt.slice(0, 200)}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    console.error("FFFA API Error:", error);
    throw error;
  }
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

  // Keep Qualification as priority, otherwise D1, otherwise first occurrence of "Championnat de France mixte"
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

  // Return first occurrence of mixte + all cups
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
