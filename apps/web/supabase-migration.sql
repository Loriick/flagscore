-- Script de migration pour modifier les types de colonnes ID
-- À exécuter dans le SQL Editor de Supabase

-- Supprimer les contraintes de clé étrangère temporairement
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_pool_id_fkey;
ALTER TABLE rankings DROP CONSTRAINT IF EXISTS rankings_pool_id_fkey;

-- Supprimer les anciennes données pour éviter les conflits
DELETE FROM matches;
DELETE FROM rankings;

-- Modifier le type de la colonne id dans la table matches
ALTER TABLE matches ALTER COLUMN id TYPE TEXT;

-- Modifier le type de la colonne id dans la table rankings  
ALTER TABLE rankings ALTER COLUMN id TYPE TEXT;

-- Recréer les contraintes de clé étrangère
ALTER TABLE matches ADD CONSTRAINT matches_pool_id_fkey 
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE;

ALTER TABLE rankings ADD CONSTRAINT rankings_pool_id_fkey 
  FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE;

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_matches_pool_id ON matches(pool_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_rankings_pool_id ON rankings(pool_id);
CREATE INDEX IF NOT EXISTS idx_rankings_position ON rankings(pool_id, position);
