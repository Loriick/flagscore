import { createClient } from "@supabase/supabase-js";

// Types pour les tables Supabase
export interface Team {
  id: string;
  name: string;
  pool_id: number;
  championship_id: number;
  season: string;
  total_matches: number;
  total_wins: number;
  total_draws: number;
  total_losses: number;
  total_goals_for: number;
  total_goals_against: number;
  total_goal_difference: number;
  total_points: number;
  best_position: number;
  worst_position: number;
  current_position: number;
  created_at: string;
  updated_at: string;
}

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
  envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON ? "SET" : "NOT SET",
});

// Mode développement : ne pas lancer d'erreur si les variables ne sont pas définies
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON
) {
  console.warn(
    "⚠️ Variables Supabase non définies - Mode développement activé"
  );
}

// Client Supabase
// ⚠️ NOTE DE SÉCURITÉ: La clé ANON de Supabase est conçue pour être exposée publiquement dans le client.
// Elle est sécurisée par les Row Level Security (RLS) policies dans Supabase.
// Ce n'est PAS une clé secrète et peut être visible dans le code JavaScript côté client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Pas d'auth pour cette app
  },
});

// Fonction utilitaire pour vérifier la configuration Supabase
function checkSupabaseConfig() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON
  ) {
    throw new Error("Supabase not configured - use FFFA fallback");
  }
}

// Utilitaires pour les requêtes
export class SupabaseService {
  // Championships
  static async getChampionships(season?: number) {
    checkSupabaseConfig();

    let query = supabase
      .from("championships")
      .select("*")
      .order("season", { ascending: false });

    // Filtrer par saison si spécifiée
    if (season) {
      query = query.eq("season", season.toString());
    }

    const { data, error } = await query;

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

  // Méthodes pour les équipes
  static async getTeams(
    searchTerm?: string,
    poolId?: number,
    championshipId?: number
  ) {
    let query = supabase.from("teams").select(`
      *,
      pools:pool_id(name, championship_id),
      championships:championship_id(name, season)
    `);

    if (searchTerm) {
      query = query.ilike("name", `%${searchTerm}%`);
    }

    if (poolId) {
      query = query.eq("pool_id", poolId);
    }

    if (championshipId) {
      query = query.eq("championship_id", championshipId);
    }

    query = query.order("name");

    const { data, error } = await query;
    if (error) throw error;
    return data as (Team & { pools: Pool; championships: Championship })[];
  }

  static async getTeamById(teamId: string) {
    const { data, error } = await supabase
      .from("teams")
      .select(
        `
        *,
        pools:pool_id(name, championship_id),
        championships:championship_id(name, season)
      `
      )
      .eq("id", teamId)
      .single();

    if (error) throw error;
    return data as Team & { pools: Pool; championships: Championship };
  }

  static async syncTeamsFromRankings() {
    console.log("🔄 Synchronisation des équipes depuis les classements...");

    // Récupérer tous les classements
    const { data: rankings, error: rankingsError } = await supabase.from(
      "rankings"
    ).select(`
        team_name,
        pool_id,
        points,
        played,
        won,
        drawn,
        lost,
        goals_for,
        goals_against,
        goal_difference,
        position
      `);

    if (rankingsError) throw rankingsError;

    if (!rankings || rankings.length === 0) {
      console.log("⚠️ Aucun classement trouvé pour synchroniser les équipes");
      return [];
    }

    // Récupérer les infos des pools pour avoir les championship_id
    const poolIds = [...new Set(rankings.map(r => r.pool_id))];
    const { data: pools, error: poolsError } = await supabase
      .from("pools")
      .select("id, championship_id")
      .in("id", poolIds);

    if (poolsError) throw poolsError;

    // Créer une map pour accéder rapidement aux championship_id
    const poolToChampionship = new Map(
      pools?.map(pool => [pool.id, pool.championship_id]) || []
    );

    // Grouper par équipe et calculer les statistiques
    const teamStats = new Map<
      string,
      {
        name: string;
        pool_id: number;
        championship_id: number;
        total_matches: number;
        total_wins: number;
        total_draws: number;
        total_losses: number;
        total_goals_for: number;
        total_goals_against: number;
        total_goal_difference: number;
        total_points: number;
        positions: number[];
      }
    >();

    for (const ranking of rankings) {
      const teamKey = `${ranking.team_name}_${ranking.pool_id}`;

      if (!teamStats.has(teamKey)) {
        teamStats.set(teamKey, {
          name: ranking.team_name,
          pool_id: ranking.pool_id,
          championship_id: poolToChampionship.get(ranking.pool_id) || 0,
          total_matches: 0,
          total_wins: 0,
          total_draws: 0,
          total_losses: 0,
          total_goals_for: 0,
          total_goals_against: 0,
          total_goal_difference: 0,
          total_points: 0,
          positions: [],
        });
      }

      const stats = teamStats.get(teamKey)!;
      stats.total_matches += ranking.played;
      stats.total_wins += ranking.won;
      stats.total_draws += ranking.drawn;
      stats.total_losses += ranking.lost;
      stats.total_goals_for += ranking.goals_for;
      stats.total_goals_against += ranking.goals_against;
      stats.total_goal_difference += ranking.goal_difference;
      stats.total_points += ranking.points;
      stats.positions.push(ranking.position);
    }

    // Insérer/mettre à jour les équipes
    const teamsToUpsert = Array.from(teamStats.values()).map(stats => ({
      id: `${stats.name}_${stats.pool_id}`.replace(/\s+/g, "_").toLowerCase(),
      name: stats.name,
      pool_id: stats.pool_id,
      championship_id: stats.championship_id,
      season: "2026", // TODO: Récupérer depuis le championship
      total_matches: stats.total_matches,
      total_wins: stats.total_wins,
      total_draws: stats.total_draws,
      total_losses: stats.total_losses,
      total_goals_for: stats.total_goals_for,
      total_goals_against: stats.total_goals_against,
      total_goal_difference: stats.total_goal_difference,
      total_points: stats.total_points,
      best_position: Math.min(...stats.positions),
      worst_position: Math.max(...stats.positions),
      current_position: stats.positions[stats.positions.length - 1] || 0,
    }));

    const { error } = await supabase
      .from("teams")
      .upsert(teamsToUpsert, { onConflict: "id" });

    if (error) throw error;

    console.log(`✅ ${teamsToUpsert.length} équipes synchronisées`);
    return teamsToUpsert;
  }
}
