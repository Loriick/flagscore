import { NextRequest } from "next/server";

import {
  createOptimizedResponse,
  createErrorResponse,
} from "@/lib/compression";
import { FFASyncService } from "@/lib/fffa-sync";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const championshipId = searchParams.get("championshipId");
    const poolId = searchParams.get("poolId");
    const season = searchParams.get("season");

    switch (action) {
      case "championships":
        const targetSeason = season ? parseInt(season) : undefined;
        const championships =
          await FFASyncService.syncChampionships(targetSeason);
        return createOptimizedResponse({
          success: true,
          data: championships,
          message: `${championships.length} championnats synchronisés`,
        });

      case "pools":
        if (!championshipId) {
          return createErrorResponse("championshipId is required", 400);
        }
        const pools = await FFASyncService.syncPools(parseInt(championshipId));
        return createOptimizedResponse({
          success: true,
          data: pools,
          message: `${pools.length} poules synchronisées`,
        });

      case "days":
        if (!poolId) {
          return createErrorResponse("poolId is required", 400);
        }
        const days = await FFASyncService.syncDays(parseInt(poolId));
        return createOptimizedResponse({
          success: true,
          data: days,
          message: `${days.length} jours synchronisés`,
        });

      case "matches":
        if (!poolId) {
          return createErrorResponse("poolId is required", 400);
        }
        const matches = await FFASyncService.syncMatches(parseInt(poolId));
        return createOptimizedResponse({
          success: true,
          data: matches,
          message: `${matches.length} matchs synchronisés`,
        });

      case "rankings":
        if (!poolId) {
          return createErrorResponse("poolId is required", 400);
        }
        const rankings = await FFASyncService.syncRankings(parseInt(poolId));
        return createOptimizedResponse({
          success: true,
          data: rankings,
          message: `${rankings.length} classements synchronisés`,
        });

      case "complete":
        if (!championshipId) {
          return createErrorResponse("championshipId is required", 400);
        }
        const result = await FFASyncService.syncChampionshipComplete(
          parseInt(championshipId)
        );
        return createOptimizedResponse({
          success: true,
          data: result,
          message: `Synchronisation complète terminée`,
        });

      case "smart":
        if (!poolId) {
          return createErrorResponse("poolId is required", 400);
        }
        const lastSync = searchParams.get("lastSync");
        const smartResult = await FFASyncService.smartSync(
          parseInt(poolId),
          lastSync || undefined
        );
        return createOptimizedResponse({
          success: true,
          data: smartResult,
          message: `Synchronisation intelligente terminée`,
        });

      default:
        return createErrorResponse(
          "Invalid action. Use: championships, pools, days, matches, rankings, complete, or smart",
          400
        );
    }
  } catch (error) {
    console.error("Erreur dans l'API de synchronisation:", error);
    return createErrorResponse("Erreur lors de la synchronisation", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, championshipId, poolId, lastSync, season } = body;

    switch (action) {
      case "championships":
        const targetSeason = season ? parseInt(season) : undefined;
        const championships =
          await FFASyncService.syncChampionships(targetSeason);
        return createOptimizedResponse({
          success: true,
          data: championships,
          message: `${championships.length} championnats synchronisés`,
        });

      case "complete":
        if (!championshipId) {
          return createErrorResponse("championshipId is required", 400);
        }
        const result =
          await FFASyncService.syncChampionshipComplete(championshipId);
        return createOptimizedResponse({
          success: true,
          data: result,
          message: `Synchronisation complète terminée`,
        });

      case "rankings":
        if (!poolId) {
          return createErrorResponse("poolId is required", 400);
        }
        const rankings = await FFASyncService.syncRankings(poolId);
        return createOptimizedResponse({
          success: true,
          data: rankings,
          message: `${rankings.length} classements synchronisés`,
        });

      case "smart":
        if (!poolId) {
          return createErrorResponse("poolId is required", 400);
        }
        const smartResult = await FFASyncService.smartSync(poolId, lastSync);
        return createOptimizedResponse({
          success: true,
          data: smartResult,
          message: `Synchronisation intelligente terminée`,
        });

      default:
        return createErrorResponse(
          "Invalid action. Use: championships, complete, rankings, or smart",
          400
        );
    }
  } catch (error) {
    console.error("Erreur dans l'API de synchronisation POST:", error);
    return createErrorResponse("Erreur lors de la synchronisation", 500);
  }
}
