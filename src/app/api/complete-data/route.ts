import { NextRequest, NextResponse } from "next/server";

import {
  getChampionships,
  getPhases,
  getPools,
  getDays,
  getMatches,
} from "../../../lib/fffa-api";
import { Match } from "../../types";

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

    // 1. Récupérer les championnats
    const championships = await getChampionships(season);
    console.log("✅ Championnats récupérés:", championships.length);

    // 2. Si pas de championshipId spécifique, prendre le premier
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

    // 3. Récupérer les phases et poules
    const phases = await getPhases(effectiveChampionshipId);
    console.log("✅ Phases récupérées:", phases.length);

    const allPools = [];
    for (const phase of phases) {
      try {
        const phasePools = await getPools(phase.id);
        allPools.push(...phasePools);
      } catch (error) {
        console.error(`❌ Erreur pools pour phase ${phase.id}:`, error);
      }
    }
    console.log("✅ Pools récupérées:", allPools.length);

    // 4. Si pas de poolId spécifique, prendre le premier
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

    // 5. Récupérer les jours et matchs
    const days = await getDays(effectivePoolId);
    console.log("✅ Jours récupérés:", days.length);

    let matchesData: Match[] = [];
    if (days.length > 0) {
      // Prendre le premier jour par défaut
      const firstDayId = poolId > 0 ? days[0]?.id || 0 : days[0]?.id || 0;
      if (firstDayId > 0) {
        matchesData = await getMatches(firstDayId);
        console.log("✅ Matchs récupérés:", matchesData.length);
      }
    }

    // 6. Retourner toutes les données
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

    console.log("🎉 Données complètes envoyées:", {
      championships: championships.length,
      pools: allPools.length,
      days: days.length,
      matches: matchesData.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Erreur API complete-data:", error);

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
