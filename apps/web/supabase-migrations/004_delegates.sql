-- Délégués de match : comptes, plateaux, feuilles de match signées, blessés.
-- À exécuter dans le SQL Editor de Supabase après 001 à 003 (idempotent).
--
-- Toutes les lectures et écritures de ces tables passent par les routes
-- serveur des apps admin et matchs (clé service_role), après contrôle de la
-- session, du rôle et de l'affectation. La RLS est activée sans aucune policy :
-- anon et authenticated ne lisent ni n'écrivent rien ici.
--
-- Premier admin : le créer dans Authentication → Users → Add user (email,
-- « Auto Confirm User »), puis :
--   INSERT INTO profiles (user_id, role, full_name)
--   SELECT id, 'admin', 'Prénom Nom' FROM auth.users WHERE email = 'vous@exemple.fr'
--   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'delegate')),
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un plateau : une poule réunie un jour, dans un lieu.
CREATE TABLE IF NOT EXISTS plateaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key TEXT NOT NULL,                   -- même clé que social_matches : 'CM|Q - J2|2026-11-29'
  pool_id INTEGER NOT NULL,                  -- id public de poule (101, 102…)
  date DATE NOT NULL,
  venue TEXT NOT NULL,
  host_club TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_plateaux_date ON plateaux(date);

CREATE TABLE IF NOT EXISTS delegate_assignments (
  plateau_id UUID NOT NULL REFERENCES plateaux(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ,
  PRIMARY KEY (plateau_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_delegate_assignments_user ON delegate_assignments(user_id);

CREATE TABLE IF NOT EXISTS match_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plateau_id UUID NOT NULL REFERENCES plateaux(id) ON DELETE CASCADE,
  match_key TEXT NOT NULL UNIQUE,            -- même clé que social_matches
  team_home TEXT NOT NULL,                   -- noms de référence « Nom (Ville) »
  team_away TEXT NOT NULL,
  score_home INTEGER CHECK (score_home BETWEEN 0 AND 300),
  score_away INTEGER CHECK (score_away BETWEEN 0 AND 300),
  forfeit TEXT CHECK (forfeit IN ('home', 'away')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'signed')),
  -- Incrémentée à chaque changement de score : une signature posée sur une
  -- version antérieure ne compte plus (deux téléphones, réseau lent).
  version INTEGER NOT NULL DEFAULT 1,
  signed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (forfeit IS NULL OR (score_home IS NULL AND score_away IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_match_sheets_plateau ON match_sheets(plateau_id);

CREATE TABLE IF NOT EXISTS sheet_signatures (
  sheet_id UUID NOT NULL REFERENCES match_sheets(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('home', 'away')),
  role TEXT NOT NULL CHECK (role IN ('coach', 'captain')),
  signer_name TEXT NOT NULL,
  signature_svg TEXT NOT NULL CHECK (length(signature_svg) < 51200),  -- attribut d d'un <path>
  sheet_version INTEGER NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (sheet_id, side, role)
);

-- Qui a été blessé et quand. Jamais la nature de la blessure ni les soins.
CREATE TABLE IF NOT EXISTS injuries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id UUID NOT NULL REFERENCES match_sheets(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('home', 'away')),
  player_name TEXT NOT NULL,
  jersey_number TEXT,
  moment TEXT,                               -- ex. « 2e mi-temps, 12e min »
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_injuries_sheet ON injuries(sheet_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor UUID,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity, entity_id);

-- Origine du score publié. Le pipeline Instagram n'envoie jamais cette
-- colonne : une ligne venue d'une feuille signée le reste.
ALTER TABLE social_matches
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'instagram',
  ADD COLUMN IF NOT EXISTS forfeit TEXT;
DO $$ BEGIN
  ALTER TABLE social_matches ADD CONSTRAINT social_matches_source_check
    CHECK (source IN ('instagram', 'manual', 'delegate'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE social_matches ADD CONSTRAINT social_matches_forfeit_check
    CHECK (forfeit IN ('home', 'away'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
UPDATE social_matches SET source = 'manual'
  WHERE reason = 'Saisi à la main' AND source = 'instagram';

-- updated_at automatique (fonction créée par supabase-schema.sql)
DROP TRIGGER IF EXISTS update_plateaux_updated_at ON plateaux;
CREATE TRIGGER update_plateaux_updated_at BEFORE UPDATE ON plateaux
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_match_sheets_updated_at ON match_sheets;
CREATE TRIGGER update_match_sheets_updated_at BEFORE UPDATE ON match_sheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS sans policy, et aucun droit pour les rôles exposés par l'API.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plateaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegate_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheet_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON profiles, plateaux, delegate_assignments, match_sheets,
  sheet_signatures, injuries, audit_log FROM anon, authenticated;
REVOKE ALL ON SEQUENCE audit_log_id_seq FROM anon, authenticated;
