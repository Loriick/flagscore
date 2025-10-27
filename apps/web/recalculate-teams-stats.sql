-- Script SQL pour recalculer les statistiques des équipes depuis les matchs réels
-- À exécuter dans Supabase SQL Editor

WITH team_stats AS (
  SELECT 
    team_home as team_name,
    pool_id,
    COUNT(*) as home_matches,
    SUM(CASE WHEN score_home > score_away THEN 1 ELSE 0 END) as home_wins,
    SUM(CASE WHEN score_home = score_away THEN 1 ELSE 0 END) as home_draws,
    SUM(CASE WHEN score_home < score_away THEN 1 ELSE 0 END) as home_losses,
    SUM(COALESCE(score_home, 0)) as home_goals_for,
    SUM(COALESCE(score_away, 0)) as home_goals_against,
    SUM(CASE WHEN score_home > score_away THEN 3 WHEN score_home = score_away THEN 1 ELSE 0 END) as home_points
  FROM matches
  WHERE score_home IS NOT NULL AND score_away IS NOT NULL
  GROUP BY team_home, pool_id
  
  UNION ALL
  
  SELECT 
    team_away as team_name,
    pool_id,
    COUNT(*) as away_matches,
    SUM(CASE WHEN score_away > score_home THEN 1 ELSE 0 END) as away_wins,
    SUM(CASE WHEN score_away = score_home THEN 1 ELSE 0 END) as away_draws,
    SUM(CASE WHEN score_away < score_home THEN 1 ELSE 0 END) as away_losses,
    SUM(COALESCE(score_away, 0)) as away_goals_for,
    SUM(COALESCE(score_home, 0)) as away_goals_against,
    SUM(CASE WHEN score_away > score_home THEN 3 WHEN score_away = score_home THEN 1 ELSE 0 END) as away_points
  FROM matches
  WHERE score_home IS NOT NULL AND score_away IS NOT NULL
  GROUP BY team_away, pool_id
),
aggregated_stats AS (
  SELECT 
    team_name,
    pool_id,
    SUM(home_matches) as total_matches,
    SUM(home_wins) as total_wins,
    SUM(home_draws) as total_draws,
    SUM(home_losses) as total_losses,
    SUM(home_goals_for) as total_goals_for,
    SUM(home_goals_against) as total_goals_against,
    SUM(home_points) as total_points
  FROM team_stats
  GROUP BY team_name, pool_id
)
UPDATE teams
SET 
  total_matches = stats.total_matches,
  total_wins = stats.total_wins,
  total_draws = stats.total_draws,
  total_losses = stats.total_losses,
  total_goals_for = stats.total_goals_for,
  total_goals_against = stats.total_goals_against,
  total_goal_difference = stats.total_goals_for - stats.total_goals_against,
  total_points = stats.total_points,
  updated_at = NOW()
FROM aggregated_stats stats
WHERE teams.name = stats.team_name AND teams.pool_id = stats.pool_id;

-- Afficher les résultats
SELECT name, pool_id, total_matches, total_wins, total_goals_for, total_goals_against, total_points 
FROM teams 
WHERE name LIKE '%FLASH%'
ORDER BY name;
