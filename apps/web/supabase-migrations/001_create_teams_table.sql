-- Création de la table teams
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pool_id INTEGER NOT NULL REFERENCES pools(id),
  championship_id INTEGER NOT NULL REFERENCES championships(id),
  season TEXT NOT NULL,
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_draws INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_goals_for INTEGER DEFAULT 0,
  total_goals_against INTEGER DEFAULT 0,
  total_goal_difference INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  best_position INTEGER DEFAULT 0,
  worst_position INTEGER DEFAULT 0,
  current_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_teams_pool_id ON teams(pool_id);
CREATE INDEX IF NOT EXISTS idx_teams_championship_id ON teams(championship_id);
CREATE INDEX IF NOT EXISTS idx_teams_season ON teams(season);

-- Index composite pour la recherche
CREATE INDEX IF NOT EXISTS idx_teams_search ON teams(name, pool_id, championship_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at 
  BEFORE UPDATE ON teams 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
