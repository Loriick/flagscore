-- Scores publiés par les clubs sur Instagram.
-- À exécuter dans le SQL Editor de Supabase (idempotent).
--
-- Flux : social_runs (collecte Apify) → social_posts (posts récupérés)
--        → score_observations (scores lus par Claude)
--        → social_matches (score retenu par match, après recoupement)
--
-- Toutes les écritures passent par la clé service_role côté serveur.
-- Aucune politique d'écriture publique n'est créée.

-- Collectes Apify
CREATE TABLE IF NOT EXISTS social_runs (
  id TEXT PRIMARY KEY,                       -- id du run Apify
  status TEXT NOT NULL DEFAULT 'started'
    CHECK (status IN ('started', 'collected', 'failed')),
  since DATE NOT NULL,
  accounts TEXT[] NOT NULL DEFAULT '{}',
  posts_count INTEGER,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Posts Instagram récupérés
CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,                       -- id Instagram du post
  run_id TEXT REFERENCES social_runs(id) ON DELETE SET NULL,
  account TEXT NOT NULL,
  permalink TEXT NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL,
  caption TEXT,
  media_type TEXT,
  image_urls JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processed', 'ignored', 'error')),
  extraction JSONB,                          -- lecture brute de Claude
  event_key TEXT,                            -- journée rattachée
  skipped_reason TEXT,
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status, posted_at);

-- Un score lu sur un post
CREATE TABLE IF NOT EXISTS score_observations (
  id TEXT PRIMARY KEY,                       -- `${post_id}#${index}`
  post_id TEXT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  account TEXT NOT NULL,
  event_key TEXT NOT NULL,
  competition TEXT NOT NULL CHECK (competition IN ('CM', 'CDF')),
  stage TEXT NOT NULL,
  event_start DATE NOT NULL,
  event_end DATE NOT NULL,
  team_raw TEXT NOT NULL,
  opponent_raw TEXT NOT NULL,
  team_score INTEGER NOT NULL,
  opponent_score INTEGER NOT NULL,
  confidence REAL NOT NULL,
  -- Résultat du rapprochement (recalculé à chaque passage)
  resolution TEXT CHECK (resolution IN ('resolved', 'ambiguous', 'unmatched')),
  match_key TEXT,
  inferred BOOLEAN NOT NULL DEFAULT FALSE,
  options JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_score_observations_event ON score_observations(event_key);

-- Score retenu par match
CREATE TABLE IF NOT EXISTS social_matches (
  match_key TEXT PRIMARY KEY,
  event_key TEXT NOT NULL,
  competition TEXT NOT NULL,
  stage TEXT NOT NULL,
  event_start DATE NOT NULL,
  event_end DATE NOT NULL,
  match_id TEXT,                             -- id FFFA quand le match existe dans `matches`
  team_home TEXT NOT NULL,
  team_away TEXT NOT NULL,
  score_home INTEGER,
  score_away INTEGER,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'single_source', 'conflict')),
  auto_apply BOOLEAN NOT NULL DEFAULT FALSE,
  -- Décision humaine : NULL = pas encore revu. Jamais écrasée par le pipeline.
  review TEXT CHECK (review IN ('approved', 'rejected')),
  reason TEXT,
  accounts TEXT[] NOT NULL DEFAULT '{}',
  observation_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_social_matches_event ON social_matches(event_key);

-- Alias validés : « Dragons » → Gavroches (Paris), « White » → Molosses A…
CREATE TABLE IF NOT EXISTS team_aliases (
  alias TEXT NOT NULL,
  team TEXT NOT NULL,                        -- nom de référence (« Nom (Ville) »)
  competition TEXT NOT NULL DEFAULT 'CM' CHECK (competition IN ('CM', 'CDF')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (alias, team, competition)
);

-- Origine du score d'un match FFFA
ALTER TABLE matches ADD COLUMN IF NOT EXISTS score_source TEXT NOT NULL DEFAULT 'fffa';
DO $$ BEGIN
  ALTER TABLE matches ADD CONSTRAINT matches_score_source_check
    CHECK (score_source IN ('fffa', 'social', 'manual'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- updated_at automatique (fonction créée par supabase-schema.sql)
DROP TRIGGER IF EXISTS update_social_matches_updated_at ON social_matches;
CREATE TRIGGER update_social_matches_updated_at BEFORE UPDATE ON social_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS : lecture publique des scores retenus seulement
ALTER TABLE social_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_aliases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read social_matches" ON social_matches;
CREATE POLICY "Public read social_matches" ON social_matches FOR SELECT USING (true);
