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
  /** `null` tant que le match n'a pas de score (match à venir). */
  team_a: { name: string; score: number | null; general_forfeit: boolean };
  team_b: { name: string; score: number | null; general_forfeit: boolean };
  sheet: string | null;
  /** Comptes Instagram d'où vient le score, quand il a été relevé sur un post. */
  sources?: string[];
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
  /** Division visée par cette place, ex. « D1 » (championnat de qualification). */
  qualification?: string;
}
