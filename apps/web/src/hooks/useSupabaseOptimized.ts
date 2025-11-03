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
        // Récupérer les données Supabase avec filtre par saison
        const supabaseData = await SupabaseService.getChampionships(season);

        // Si Supabase a des données, les retourner immédiatement
        if (supabaseData && supabaseData.length > 0) {
          console.log("📊 Utilisation des données Supabase (immédiat)");
          await logger.logSupabaseSync("championships_loaded", {
            count: supabaseData.length,
            source: "supabase_cache",
            season: season,
          });
          return { data: supabaseData, source: "supabase" };
        }

        // Si pas de données Supabase, synchroniser depuis FFFA
        console.log("🔄 Première synchronisation des championnats...");
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

        // Si pas de données Supabase, synchroniser tout
        console.log("🔄 Première synchronisation des championnats...");
        for (const championship of fffaChampionships) {
          try {
            await SupabaseService.syncChampionship(championship);
          } catch (syncError) {
            console.warn("⚠️ Erreur de synchronisation:", syncError);
          }
        }

        await logger.logSupabaseSync("championships_sync_complete", {
          count: fffaChampionships.length,
          source: "fffa",
        });
        return { data: fffaChampionships, source: "fffa" };
      } catch (error) {
        console.error("❌ Erreur dans useChampionshipsOptimized:", error);
        await logger.error("useChampionshipsOptimized_error", {
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
        // Récupérer les données Supabase
        const supabaseData =
          await SupabaseService.getPoolsByChampionship(championshipId);

        // Si Supabase a des données, les retourner immédiatement
        if (supabaseData && supabaseData.length > 0) {
          console.log("📊 Utilisation des données Supabase (immédiat)");
          return { data: supabaseData, source: "supabase" };
        }

        // Si pas de données Supabase, synchroniser depuis FFFA
        console.log("🔄 Première synchronisation des poules...");
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

        // Si pas de données Supabase, synchroniser tout
        console.log("🔄 Première synchronisation des poules...");
        for (const pool of fffaPools) {
          try {
            await SupabaseService.syncPool(pool, championshipId);
          } catch (syncError) {
            console.warn("⚠️ Erreur de synchronisation:", syncError);
          }
        }

        return { data: fffaPools, source: "fffa" };
      } catch (error) {
        console.error("❌ Erreur dans usePoolsOptimized:", error);
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
        // Essayer Supabase en premier
        const supabaseData = await SupabaseService.getDaysByPool(poolId);

        if (supabaseData && supabaseData.length > 0) {
          console.log("📊 Utilisation des données Supabase");
          return { data: supabaseData, source: "supabase" };
        }

        // Sinon, utiliser FFFA
        console.log("🔄 Utilisation des données FFFA...");
        const fffaDays = await getDays(poolId);
        const days = fffaDays.map(d => ({
          id: d.id,
          pool_id: poolId,
          name: d.label,
          date: d.date,
        }));

        return { data: days, source: "fffa" };
      } catch (error) {
        console.error("❌ Erreur dans useDaysOptimized:", error);
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
        // Récupérer les données Supabase
        const supabaseData = await SupabaseService.getMatchesByPool(poolId);

        // Récupérer les données FFFA pour comparaison
        const days = await getDays(poolId);
        const fffaMatches = [];
        for (const day of days) {
          const dayMatches = await getMatches(day.id);
          fffaMatches.push(
            ...dayMatches.map(m => {
              // Créer un ID unique basé sur le jour + les équipes
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

        // Si Supabase a des données, vérifier s'il y a du nouveau ou des scores modifiés
        if (supabaseData && supabaseData.length > 0) {
          const supabaseById = new Map(supabaseData.map(m => [m.id, m]));
          // const fffaIds = new Set(fffaMatches.map(m => m.id));

          // Vérifier s'il y a de nouveaux matchs
          const hasNewMatches = fffaMatches.some(m => !supabaseById.has(m.id));

          // Vérifier des écarts de scores/statuts
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
            if (hasNewMatches) {
              console.log("🔄 Nouveaux matchs détectés, synchronisation...");
            }
            if (changed.length > 0) {
              console.log(
                `📝 Scores mis à jour détectés (${changed.length}), synchronisation...`
              );
            }
            // Synchroniser nouveaux matchs et scores modifiés
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
                  console.warn("⚠️ Erreur de synchronisation:", syncError);
                }
              }
            }
            // Récupérer les données mises à jour
            const updatedSupabaseData =
              await SupabaseService.getMatchesByPool(poolId);
            return { data: updatedSupabaseData, source: "supabase" };
          } else {
            console.log("📊 Utilisation des données Supabase (à jour)");
            return { data: supabaseData, source: "supabase" };
          }
        }

        // Si pas de données Supabase, synchroniser tout
        console.log("🔄 Première synchronisation des matchs...");
        for (const match of fffaMatches) {
          try {
            await SupabaseService.syncMatch(match, poolId);
          } catch (syncError) {
            console.warn("⚠️ Erreur de synchronisation:", syncError);
          }
        }

        return { data: fffaMatches, source: "fffa" };
      } catch (error) {
        console.error("❌ Erreur dans useMatchesOptimized:", error);
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
        // Récupérer les données Supabase
        const supabaseData = await SupabaseService.getRankingsByPool(poolId);

        // Si Supabase a des données, les retourner immédiatement
        if (supabaseData && supabaseData.length > 0) {
          console.log("📊 Utilisation des données Supabase (immédiat)");
          return { data: supabaseData, source: "supabase" };
        }

        // Si pas de données Supabase, synchroniser depuis FFFA
        console.log("🔄 Première synchronisation des classements...");
        const fffaData = await getRankings(poolId);
        const fffaRankings = Array.isArray(fffaData) ? fffaData : [fffaData];

        // Si pas de données Supabase, synchroniser tout
        console.log("🔄 Première synchronisation des classements...");
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
            console.warn("⚠️ Erreur de synchronisation:", syncError);
          }
        }

        return { data: fffaRankings, source: "fffa" };
      } catch (error) {
        console.error("❌ Erreur dans useRankingsOptimized:", error);
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
