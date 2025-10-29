export interface Championship {
  id: number;
  label: string;
  season: number;
  male: boolean;
}

export interface Pool {
  id: number;
  championship_id: number;
  phase_id: number;
  label: string;
}

export interface Day {
  id: number;
  championship_id: number;
  phase_id: number;
  pool_id: number;
  label: string;
  date: string;
  number: number;
}

export interface Match {
  id: number;
  championship_id: number;
  phase_id: number;
  pool_id: number;
  day_id: number;
  date: string;
  team_a: { name: string; score: number; general_forfeit: boolean };
  team_b: { name: string; score: number; general_forfeit: boolean };
  sheet: string | null;
}

export interface Ranking {
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
}
