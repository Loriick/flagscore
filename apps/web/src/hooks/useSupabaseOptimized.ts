import { useQuery } from "@tanstack/react-query";

import {
  getSeasons,
  getChampionships,
  getPhases,
  getPools,
  getDays,
  getMatches,
  getRankings,
} from "@/lib/fffa-api";
import { logger } from "@/lib/logger-advanced";
import { SupabaseService } from "@/lib/supabase";

// Hook optimisé pour les championnats (Supabase en priorité)
export function useChampionshipsOptimized(season?: number) {
  return useQuery({
    queryKey: ["championships", "optimized", season],
    queryFn: async () => {
      try {
        const supabaseData = await SupabaseService.getChampionships(season);

        if (supabaseData && supabaseData.length > 0) {
          logger.debug("Championships loaded from Supabase cache", { count: supabaseData.length, season });
          await logger.logSupabaseSync("championships_loaded", {
            count: supabaseData.length,
            source: "supabase_cache",
            season: season,
          });
          return { data: supabaseData, source: "supabase" };
        }

        logger.debug("No championships in Supabase, syncing from FFFA...", { season });
        await logger.logSupabaseSync("championships_sync_start", {
          reason: "no_supabase_data",
          season: season,
        });
        const targetSeason = season || Math.max(...(await getSeasons()));
        const fffaData = await getChampionships(targetSeason);
        const fffaChampionships = fffaData.map(c => ({
          id: c.id,
          name: c.label,
          season: c.season.toString(),
        }));

        for (const championship of fffaChampionships) {
          try {
            await SupabaseService.syncChampionship(championship);
          } catch (syncError) {
            logger.warn("Championship sync error", { error: String(syncError) });
          }
        }

        await logger.logSupabaseSync("championships_sync_complete", {
          count: fffaChampionships.length,
          source: "fffa",
        });
        return { data: fffaChampionships, source: "fffa" };
      } catch (error) {
        await logger.error("useChampionshipsOptimized error", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Hook optimisé pour les pools
export function usePoolsOptimized(championshipId: number) {
  return useQuery({
    queryKey: ["pools", "optimized", championshipId],
    queryFn: async () => {
      try {
        const supabaseData =
          await SupabaseService.getPoolsByChampionship(championshipId);

        if (supabaseData && supabaseData.length > 0) {
          logger.debug("Pools loaded from Supabase cache", { count: supabaseData.length, championshipId });
          return { data: supabaseData, source: "supabase" };
        }

        logger.debug("No pools in Supabase, syncing from FFFA...", { championshipId });
        const phases = await getPhases(championshipId);
        const fffaPools = [];
        for (const phase of phases) {
          const phasePools = await getPools(phase.id);
          fffaPools.push(
            ...phasePools.map(p => ({
              id: p.id,
              championship_id: championshipId,
              name: p.label,
            }))
          );
        }

        for (const pool of fffaPools) {
          try {
            await SupabaseService.syncPool(pool, championshipId);
          } catch (syncError) {
            logger.warn("Pool sync error", { error: String(syncError) });
          }
        }

        return { data: fffaPools, source: "fffa" };
      } catch (error) {
        await logger.error("usePoolsOptimized error", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: !!championshipId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// Hook optimisé pour les jours
export function useDaysOptimized(poolId: number) {
  return useQuery({
    queryKey: ["days", "optimized", poolId],
    queryFn: async () => {
      try {
        const supabaseData = await SupabaseService.getDaysByPool(poolId);

        if (supabaseData && supabaseData.length > 0) {
          logger.debug("Days loaded from Supabase cache", { count: supabaseData.length, poolId });
          return { data: supabaseData, source: "supabase" };
        }

        logger.debug("No days in Supabase, fetching from FFFA...", { poolId });
        const fffaDays = await getDays(poolId);
        const days = fffaDays.map(d => ({
          id: d.id,
          pool_id: poolId,
          name: d.label,
          date: d.date,
        }));

        return { data: days, source: "fffa" };
      } catch (error) {
        await logger.error("useDaysOptimized error", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: !!poolId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// Hook optimisé pour les matches
export function useMatchesOptimized(poolId: number) {
  return useQuery({
    queryKey: ["matches", "optimized", poolId],
    queryFn: async () => {
      try {
        const supabaseData = await SupabaseService.getMatchesByPool(poolId);

        const days = await getDays(poolId);
        const fffaMatches = [];
        for (const day of days) {
          const dayMatches = await getMatches(day.id);
          fffaMatches.push(
            ...dayMatches.map(m => {
              const uniqueId =
                `${day.id}_${m.team_a.name}_${m.team_b.name}`.replace(
                  /\s+/g,
                  "_"
                );
              return {
                id: uniqueId,
                pool_id: poolId,
                team_home: m.team_a.name,
                team_away: m.team_b.name,
                score_home: m.team_a.score,
                score_away: m.team_b.score,
                match_date: m.date,
                status: "scheduled",
              };
            })
          );
        }

        if (supabaseData && supabaseData.length > 0) {
          const supabaseById = new Map(supabaseData.map(m => [m.id, m]));

          const hasNewMatches = fffaMatches.some(m => !supabaseById.has(m.id));
          const changed = fffaMatches.filter(m => {
            const existing = supabaseById.get(m.id);
            if (!existing) return false;
            return (
              (existing.score_home || 0) !== (m.score_home || 0) ||
              (existing.score_away || 0) !== (m.score_away || 0) ||
              (existing.status || "scheduled") !== (m.status || "scheduled")
            );
          });

          if (hasNewMatches || changed.length > 0) {
            logger.debug("Matches diff detected, syncing...", {
              poolId,
              hasNewMatches,
              changedCount: changed.length,
            });
            for (const match of fffaMatches) {
              const existing = supabaseById.get(match.id);
              const isNew = !existing;
              const hasDiff = existing
                ? (existing.score_home || 0) !== (match.score_home || 0) ||
                  (existing.score_away || 0) !== (match.score_away || 0) ||
                  (existing.status || "scheduled") !==
                    (match.status || "scheduled")
                : false;
              if (isNew || hasDiff) {
                try {
                  await SupabaseService.syncMatch(match, poolId);
                } catch (syncError) {
                  logger.warn("Match sync error", { error: String(syncError) });
                }
              }
            }
            const updatedSupabaseData =
              await SupabaseService.getMatchesByPool(poolId);
            return { data: updatedSupabaseData, source: "supabase" };
          }

          logger.debug("Matches loaded from Supabase cache (up to date)", { poolId });
          return { data: supabaseData, source: "supabase" };
        }

        logger.debug("No matches in Supabase, syncing from FFFA...", { poolId });
        for (const match of fffaMatches) {
          try {
            await SupabaseService.syncMatch(match, poolId);
          } catch (syncError) {
            logger.warn("Match sync error", { error: String(syncError) });
          }
        }

        return { data: fffaMatches, source: "fffa" };
      } catch (error) {
        await logger.error("useMatchesOptimized error", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: !!poolId,
    staleTime: 2 * 60 * 1000, // 2 minutes pour les matchs
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Hook optimisé pour les rankings
export function useRankingsOptimized(poolId: number) {
  return useQuery({
    queryKey: ["rankings", "optimized", poolId],
    queryFn: async () => {
      try {
        const supabaseData = await SupabaseService.getRankingsByPool(poolId);

        if (supabaseData && supabaseData.length > 0) {
          logger.debug("Rankings loaded from Supabase cache", { count: supabaseData.length, poolId });
          return { data: supabaseData, source: "supabase" };
        }

        logger.debug("No rankings in Supabase, syncing from FFFA...", { poolId });
        const fffaData = await getRankings(poolId);
        const fffaRankings = Array.isArray(fffaData) ? fffaData : [fffaData];

        for (const ranking of fffaRankings) {
          try {
            const uniqueId = `${poolId}_${ranking.club.label}`.replace(
              /\s+/g,
              "_"
            );
            await SupabaseService.syncRanking(
              {
                id: uniqueId,
                team_name: ranking.club.label,
                position: ranking.position,
                points: ranking.cf,
                played: ranking.j,
                won: ranking.g,
                drawn: ranking.n,
                lost: ranking.p,
                goals_for: ranking.f,
                goals_against: ranking.f,
                goal_difference: ranking.points_diff,
              },
              poolId
            );
          } catch (syncError) {
            logger.warn("Ranking sync error", { error: String(syncError) });
          }
        }

        return { data: fffaRankings, source: "fffa" };
      } catch (error) {
        await logger.error("useRankingsOptimized error", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: !!poolId,
    staleTime: 2 * 60 * 1000, // 2 minutes pour les classements
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Hook pour récupérer une poule par ID
export function usePoolById(poolId: number) {
  return useQuery({
    queryKey: ["pool", "by-id", poolId],
    queryFn: async () => {
      const data = await SupabaseService.getPoolById(poolId);
      return { data, source: "supabase" };
    },
    enabled: !!poolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}
