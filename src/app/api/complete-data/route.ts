import { NextRequest, NextResponse } from "next/server";

import {
  getChampionships,
  getPhases,
  getPools,
  getDays,
  getMatches,
} from "../../../lib/fffa-api";
import { Match } from "../../types";

import logger from "@/src/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = Number(searchParams.get("season")) || 2026;
    const championshipId = Number(searchParams.get("championshipId")) || 0;
    const poolId = Number(searchParams.get("poolId")) || 0;

    console.log("🚀 API /api/complete-data:", {
      season,
      championshipId,
      poolId,
    });

    // 1. Get championships
    const championships = await getChampionships(season);
    console.log("✅ Championnats récupérés:", championships.length);

    // 2. If no specific championshipId, take the first one
    const effectiveChampionshipId =
      championshipId > 0 ? championshipId : championships[0]?.id || 0;

    if (effectiveChampionshipId === 0) {
      return NextResponse.json({
        championships: [],
        pools: [],
        days: [],
        matches: [],
        error: "Aucun championnat trouvé",
      });
    }

    // 3. Get phases and pools
    const phases = await getPhases(effectiveChampionshipId);
    console.log("✅ Phases récupérées:", phases.length);

    const allPools = [];
    for (const phase of phases) {
      try {
        const phasePools = await getPools(phase.id);
        allPools.push(...phasePools);
      } catch (error) {
        logger.error(`ERROR pools for phase ${phase.id}:`, error);
      }
    }

    // 4. If no specific poolId, take the first one
    const effectivePoolId = poolId > 0 ? poolId : allPools[0]?.id || 0;

    if (effectivePoolId === 0) {
      return NextResponse.json({
        championships,
        pools: allPools,
        days: [],
        matches: [],
        error: "Aucune poule trouvée",
      });
    }

    // 5. Get days and matches
    const days = await getDays(effectivePoolId);

    let matchesData: Match[] = [];
    if (days.length > 0) {
      // Take the first day by default
      const firstDayId = poolId > 0 ? days[0]?.id || 0 : days[0]?.id || 0;
      if (firstDayId > 0) {
        matchesData = await getMatches(firstDayId);
      }
    }

    // 6. Return all data
    const response = {
      championships,
      pools: allPools,
      days,
      matches: matchesData,
      selectedChampionshipId: effectiveChampionshipId,
      selectedPoolId: effectivePoolId,
      selectedDayId: days[0]?.id || 0,
      cached: false,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("ERROR API complete-data:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("too many requests") ||
        error.message.includes("rate limit")
      ) {
        return NextResponse.json(
          { error: "Trop de requêtes - Veuillez patienter" },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Erreur lors du chargement des données" },
      { status: 500 }
    );
  }
}
