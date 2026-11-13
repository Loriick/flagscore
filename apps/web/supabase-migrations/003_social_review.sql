-- Validation humaine des scores relevés sur Instagram (page /admin/scores).
--
-- Le pipeline réécrit score_home / score_away à chaque rapprochement ; une
-- correction faite à la main est donc gardée dans des colonnes à part, que le
-- pipeline n'envoie jamais.
ALTER TABLE social_matches
  ADD COLUMN IF NOT EXISTS review_score_home INTEGER,
  ADD COLUMN IF NOT EXISTS review_score_away INTEGER,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
