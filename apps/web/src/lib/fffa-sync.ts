import {
  getSeasons,
  getChampionships,
  getPhases,
  getPools,
  getDays,
  getMatches,
  getRankings,
} from "./fffa-api";
import { SupabaseService } from "./supabase";

// Service de synchronisation FFFA → Supabase
export class FFASyncService {
  // Synchroniser tous les championnats
  static async syncChampionships(season?: number) {
    try {
      console.log("🔄 Synchronisation des championnats...");

      // Utiliser la saison spécifiée ou la dernière saison disponible
      const targetSeason = season || Math.max(...(await getSeasons()));

      // Récupérer les championnats de la saison cible
      const fffaData = await getChampionships(targetSeason);

      const syncedChampionships = [];
      for (const championship of fffaData) {
        const synced = await SupabaseService.syncChampionship({
          id: championship.id,
          name: championship.label,
          season: championship.season.toString(),
        });
        syncedChampionships.push(synced);
        console.log(`✅ Championnat synchronisé: ${synced.name}`);
      }

      console.log(`🎉 ${syncedChampionships.length} championnats synchronisés`);
      return syncedChampionships;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la synchronisation des championnats:",
        error
      );
      throw error;
    }
  }

  // Synchroniser les poules d'un championnat
  static async syncPools(championshipId: number) {
    try {
      console.log(
        `🔄 Synchronisation des poules pour le championnat ${championshipId}...`
      );

      // Récupérer les phases du championnat
      const phases = await getPhases(championshipId);

      const syncedPools = [];
      for (const phase of phases) {
        // Récupérer les poules de chaque phase
        const pools = await getPools(phase.id);

        for (const pool of pools) {
          const synced = await SupabaseService.syncPool(
            {
              id: pool.id,
              name: pool.label,
              championship_id: championshipId,
            },
            championshipId
          );
          syncedPools.push(synced);
          console.log(`✅ Poule synchronisée: ${synced.name}`);
        }
      }

      console.log(`🎉 ${syncedPools.length} poules synchronisées`);
      return syncedPools;
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation des poules:", error);
      throw error;
    }
  }

  // Synchroniser les jours d'une poule
  static async syncDays(poolId: number) {
    try {
      console.log(`🔄 Synchronisation des jours pour la poule ${poolId}...`);

      const fffaDays = await getDays(poolId);

      const syncedDays = [];
      for (const day of fffaDays) {
        const synced = await SupabaseService.syncDay(
          {
            id: day.id,
            name: day.label,
            date: day.date,
          },
          poolId
        );
        syncedDays.push(synced);
        console.log(`✅ Jour synchronisé: ${synced.name} (${synced.date})`);
      }

      console.log(`🎉 ${syncedDays.length} jours synchronisés`);
      return syncedDays;
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation des jours:", error);
      throw error;
    }
  }

  // Synchroniser les matchs d'une poule
  static async syncMatches(poolId: number) {
    try {
      console.log(`🔄 Synchronisation des matchs pour la poule ${poolId}...`);

      // Récupérer les jours de la poule
      const days = await getDays(poolId);

      const syncedMatches = [];
      for (const day of days) {
        // Récupérer les matchs de chaque jour
        const matches = await getMatches(day.id);

        for (const match of matches) {
          // Créer un ID unique basé sur le jour + les équipes
          const uniqueId =
            `${day.id}_${match.team_a.name}_${match.team_b.name}`.replace(
              /\s+/g,
              "_"
            );
          const synced = await SupabaseService.syncMatch(
            {
              id: uniqueId,
              team_home: match.team_a.name,
              team_away: match.team_b.name,
              score_home: match.team_a.score,
              score_away: match.team_b.score,
              match_date: match.date,
              status: "scheduled",
            },
            poolId
          );
          syncedMatches.push(synced);
          console.log(
            `✅ Match synchronisé: ${synced.team_home} vs ${synced.team_away}`
          );
        }
      }

      console.log(`🎉 ${syncedMatches.length} matchs synchronisés`);
      return syncedMatches;
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation des matchs:", error);
      throw error;
    }
  }

  // Synchroniser les classements d'une poule
  static async syncRankings(poolId: number) {
    try {
      console.log(
        `🔄 Synchronisation des classements pour la poule ${poolId}...`
      );

      const fffaData = await getRankings(poolId);
      const rankings = Array.isArray(fffaData) ? fffaData : [fffaData];

      const syncedRankings = [];
      for (const ranking of rankings) {
        // Créer un ID unique basé sur le nom de l'équipe
        const uniqueId = `${poolId}_${ranking.club.label}`.replace(/\s+/g, "_");
        const synced = await SupabaseService.syncRanking(
          {
            id: uniqueId,
            team_name: ranking.club.label,
            position: ranking.position,
            points: ranking.points, // Utiliser ranking.points au lieu de ranking.cf
            played: ranking.j,
            won: ranking.g,
            drawn: ranking.n,
            lost: ranking.p,
            goals_for: ranking.points_won, // Utiliser les vrais buts marqués
            goals_against: ranking.points_loss, // Utiliser les vrais buts encaissés
            goal_difference: ranking.points_diff,
          },
          poolId
        );
        syncedRankings.push(synced);
        console.log(
          `✅ Classement synchronisé: ${synced.team_name} (${synced.position})`
        );
      }

      console.log(`🎉 ${syncedRankings.length} classements synchronisés`);
      return syncedRankings;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la synchronisation des classements:",
        error
      );
      throw error;
    }
  }

  // Synchronisation complète d'un championnat
  static async syncChampionshipComplete(championshipId: number) {
    try {
      console.log(
        `🚀 Synchronisation complète du championnat ${championshipId}...`
      );

      // 1. Synchroniser les poules
      const pools = await this.syncPools(championshipId);

      // 2. Pour chaque poule, synchroniser matchs et classements
      for (const pool of pools) {
        await Promise.all([
          this.syncMatches(pool.id),
          this.syncRankings(pool.id),
        ]);
      }

      console.log(
        `🎉 Synchronisation complète terminée pour le championnat ${championshipId}`
      );
      return { championshipId, poolsCount: pools.length };
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation complète:", error);
      throw error;
    }
  }

  // Synchronisation intelligente (vérifie les timestamps)
  static async smartSync(poolId: number, lastSync?: string) {
    try {
      console.log(`🧠 Synchronisation intelligente pour la poule ${poolId}...`);

      // Vérifier si les données Supabase sont à jour
      const supabaseMatches = await SupabaseService.getMatchesByPool(poolId);
      const supabaseRankings = await SupabaseService.getRankingsByPool(poolId);

      if (supabaseMatches.length === 0 || supabaseRankings.length === 0) {
        console.log("📥 Données manquantes, synchronisation complète...");
        await Promise.all([
          this.syncMatches(poolId),
          this.syncRankings(poolId),
        ]);
        return { type: "full", poolId };
      }

      // Vérifier les timestamps pour une synchronisation incrémentale
      const latestSupabaseUpdate = Math.max(
        ...supabaseMatches.map(m => new Date(m.updated_at).getTime()),
        ...supabaseRankings.map(r => new Date(r.updated_at).getTime())
      );

      if (lastSync && new Date(lastSync).getTime() > latestSupabaseUpdate) {
        console.log(
          "✅ Données Supabase à jour, pas de synchronisation nécessaire"
        );
        return { type: "skip", poolId };
      }

      console.log("🔄 Synchronisation incrémentale...");
      await Promise.all([this.syncMatches(poolId), this.syncRankings(poolId)]);

      return { type: "incremental", poolId };
    } catch (error) {
      console.error(
        "❌ Erreur lors de la synchronisation intelligente:",
        error
      );
      throw error;
    }
  }
}
