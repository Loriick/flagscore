export type Championship = {
  id: number;
  label: string;
  season: number;
  male: boolean;
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
  points: number;
  j: number;
  g: number;
  n: number;
  p: number;
  points_won: number;
  points_loss: number;
  points_diff: number;
};

// Types Supabase - Structures de base de données
export interface SupabaseTeam {
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

export interface SupabaseChampionship {
  id: number;
  name: string;
  season: string;
  created_at: string;
  updated_at: string;
}

export interface SupabasePool {
  id: number;
  championship_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseDay {
  id: number;
  pool_id: number;
  name: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseMatch {
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

export interface SupabaseRanking {
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

// Relations Supabase pour les jointures
export interface PoolWithChampionship extends SupabasePool {
  championships?: SupabaseChampionship | null;
}

export interface TeamWithRelations extends SupabaseTeam {
  pools?: PoolWithChampionship | null;
  championships?: SupabaseChampionship | null;
}
