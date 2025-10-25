import { createClient } from "@supabase/supabase-js";

// Types pour les tables Supabase
export interface Championship {
  id: number;
  name: string;
  season: string;
  created_at: string;
  updated_at: string;
}

export interface Pool {
  id: number;
  championship_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Day {
  id: number;
  pool_id: number;
  name: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  pool_id: number;
  team_home: string;
  team_away: string;
  score_home: number | null;
  score_away: number | null;
  match_date: string;
  status: "scheduled" | "live" | "finished";
  created_at: string;
  updated_at: string;
}

export interface Ranking {
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
  created_at: string;
  updated_at: string;
}

// Configuration Supabase - Hardcodé temporairement pour test
const supabaseUrl = "https://rwpuibfvysbbegtumvlv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cHVpYmZ2eXNiYmVndHVtdmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjc5NDEsImV4cCI6MjA3NjkwMzk0MX0.UulbnAo0zDGdX5XkkB0lJ-csiyeJ7bNSNb1RQS7c6pM";

// Force l'utilisation des bonnes valeurs côté client
if (typeof window !== "undefined") {
  console.log("🔧 Force Supabase config côté client:", {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });
}

// Debug: Log des variables d'environnement
console.log("🔍 Debug Supabase Config:", {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length || 0,
  envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET",
});

// Mode développement : ne pas lancer d'erreur si les variables ne sont pas définies
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.warn(
    "⚠️ Variables Supabase non définies - Mode développement activé"
  );
}

// Client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Pas d'auth pour cette app
  },
});

// Fonction utilitaire pour vérifier la configuration Supabase
function checkSupabaseConfig() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Supabase not configured - use FFFA fallback");
  }
}

// Utilitaires pour les requêtes
export class SupabaseService {
  // Championships
  static async getChampionships() {
    checkSupabaseConfig();

    const { data, error } = await supabase
      .from("championships")
      .select("*")
      .order("season", { ascending: false });

    if (error) throw error;
    return data as Championship[];
  }

  static async getChampionshipById(id: number) {
    checkSupabaseConfig();

    const { data, error } = await supabase
      .from("championships")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Championship;
  }

  // Pools
  static async getPoolsByChampionship(championshipId: number) {
    checkSupabaseConfig();

    const { data, error } = await supabase
      .from("pools")
      .select("*")
      .eq("championship_id", championshipId)
      .order("name");

    if (error) throw error;
    return data as Pool[];
  }

  static async getPoolById(poolId: number) {
    checkSupabaseConfig();

    const { data, error } = await supabase
      .from("pools")
      .select("*")
      .eq("id", poolId)
      .single();

    if (error) throw error;
    return data as Pool;
  }

  // Days
  static async getDaysByPool(poolId: number) {
    checkSupabaseConfig();

    const { data, error } = await supabase
      .from("days")
      .select("*")
      .eq("pool_id", poolId)
      .order("date");

    if (error) throw error;
    return data as Day[];
  }

  static async getDayById(id: number) {
    checkSupabaseConfig();

    const { data, error } = await supabase
      .from("days")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Day;
  }

  // Matches
  static async getMatchesByPool(poolId: number) {
    checkSupabaseConfig();

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("pool_id", poolId)
      .order("match_date");

    if (error) throw error;
    return data as Match[];
  }

  static async getMatchesByDate(date: string) {
    checkSupabaseConfig();

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("match_date", date)
      .order("match_date");

    if (error) throw error;
    return data as Match[];
  }

  // Rankings
  static async getRankingsByPool(poolId: number) {
    checkSupabaseConfig();

    const { data, error } = await supabase
      .from("rankings")
      .select("*")
      .eq("pool_id", poolId)
      .order("position");

    if (error) throw error;
    return data as Ranking[];
  }

  // Synchronisation FFFA
  static async syncChampionship(fffaData: {
    id: number;
    name: string;
    season: string;
  }) {
    const { data, error } = await supabase
      .from("championships")
      .upsert({
        id: fffaData.id,
        name: fffaData.name,
        season: fffaData.season,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data[0] as Championship;
  }

  static async syncPool(
    fffaData: { id: number; name: string; championship_id: number },
    championshipId: number
  ) {
    const { data, error } = await supabase
      .from("pools")
      .upsert({
        id: fffaData.id,
        championship_id: championshipId,
        name: fffaData.name,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data[0] as Pool;
  }

  static async syncDay(
    fffaData: { id: number; name: string; date: string },
    poolId: number
  ) {
    const { data, error } = await supabase
      .from("days")
      .upsert({
        id: fffaData.id,
        pool_id: poolId,
        name: fffaData.name,
        date: fffaData.date,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data[0] as Day;
  }

  static async syncMatch(
    fffaData: {
      id: string;
      team_home: string;
      team_away: string;
      score_home: number | null;
      score_away: number | null;
      match_date: string;
      status: string;
    },
    poolId: number
  ) {
    const { data, error } = await supabase
      .from("matches")
      .upsert({
        id: fffaData.id,
        pool_id: poolId,
        team_home: fffaData.team_home,
        team_away: fffaData.team_away,
        score_home: fffaData.score_home,
        score_away: fffaData.score_away,
        match_date: fffaData.match_date,
        status: fffaData.status,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data[0] as Match;
  }

  static async syncRanking(
    fffaData: {
      id: string;
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
    },
    poolId: number
  ) {
    const { data, error } = await supabase
      .from("rankings")
      .upsert({
        id: fffaData.id,
        pool_id: poolId,
        team_name: fffaData.team_name,
        position: fffaData.position,
        points: fffaData.points,
        played: fffaData.played,
        won: fffaData.won,
        drawn: fffaData.drawn,
        lost: fffaData.lost,
        goals_for: fffaData.goals_for,
        goals_against: fffaData.goals_against,
        goal_difference: fffaData.goal_difference,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data[0] as Ranking;
  }
}
