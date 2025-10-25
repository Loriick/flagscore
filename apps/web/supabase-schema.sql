-- Script SQL pour créer les tables Supabase pour Flagscore
-- À exécuter dans le SQL Editor de Supabase

-- Table des championnats
CREATE TABLE IF NOT EXISTS championships (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  season TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des poules
CREATE TABLE IF NOT EXISTS pools (
  id INTEGER PRIMARY KEY,
  championship_id INTEGER NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des jours de compétition
CREATE TABLE IF NOT EXISTS days (
  id INTEGER PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des matchs
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  team_home TEXT NOT NULL,
  team_away TEXT NOT NULL,
  score_home INTEGER,
  score_away INTEGER,
  match_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des classements
CREATE TABLE IF NOT EXISTS rankings (
  id TEXT PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  position INTEGER NOT NULL,
  points DECIMAL(5,2) NOT NULL DEFAULT 0,
  played INTEGER NOT NULL DEFAULT 0,
  won INTEGER NOT NULL DEFAULT 0,
  drawn INTEGER NOT NULL DEFAULT 0,
  lost INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  goal_difference INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pool_id, team_name)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_pools_championship_id ON pools(championship_id);
CREATE INDEX IF NOT EXISTS idx_days_pool_id ON days(pool_id);
CREATE INDEX IF NOT EXISTS idx_days_date ON days(date);
CREATE INDEX IF NOT EXISTS idx_matches_pool_id ON matches(pool_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_rankings_pool_id ON rankings(pool_id);
CREATE INDEX IF NOT EXISTS idx_rankings_position ON rankings(pool_id, position);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_championships_updated_at BEFORE UPDATE ON championships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pools_updated_at BEFORE UPDATE ON pools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_days_updated_at BEFORE UPDATE ON days FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rankings_updated_at BEFORE UPDATE ON rankings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS (Row Level Security) - Lecture publique
ALTER TABLE championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre la lecture publique
CREATE POLICY "Allow public read access on championships" ON championships FOR SELECT USING (true);
CREATE POLICY "Allow public read access on pools" ON pools FOR SELECT USING (true);
CREATE POLICY "Allow public read access on days" ON days FOR SELECT USING (true);
CREATE POLICY "Allow public read access on matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access on rankings" ON rankings FOR SELECT USING (true);

-- Politiques pour permettre l'insertion/update (pour la synchronisation)
CREATE POLICY "Allow public insert on championships" ON championships FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on championships" ON championships FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on pools" ON pools FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on pools" ON pools FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on days" ON days FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on days" ON days FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on matches" ON matches FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on rankings" ON rankings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rankings" ON rankings FOR UPDATE USING (true);
