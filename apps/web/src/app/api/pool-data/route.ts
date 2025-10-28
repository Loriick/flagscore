import { NextRequest, NextResponse } from "next/server";

import { getDays, getMatches } from "../../../lib/fffa-api";
import { Match } from "@flagscore/shared";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = Number(searchParams.get("poolId")) || 0;
    const dayId = Number(searchParams.get("dayId")) || 0;

    console.log("🚀 API /api/pool-data:", { poolId, dayId });

    if (poolId === 0) {
      return NextResponse.json({
        days: [],
        matches: [],
        error: "Pool ID requis",
      });
    }

    // Get days for this pool
    const days = await getDays(poolId);
    console.log("✅ Jours récupérés:", days.length);

    // Get matches for specified day or first day
    let matchesData: Match[] = [];
    const effectiveDayId = dayId > 0 ? dayId : days[0]?.id || 0;

    if (effectiveDayId > 0) {
      matchesData = await getMatches(effectiveDayId);
      console.log("✅ Matchs récupérés:", matchesData.length);
    }

    const response = {
      days,
      matches: matchesData,
      selectedDayId: effectiveDayId,
      cached: false,
    };

    console.log("🎉 Données de poule envoyées:", {
      days: days.length,
      matches: matchesData.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Erreur API pool-data:", error);

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
      { error: "Erreur lors du chargement des données de poule" },
      { status: 500 }
    );
  }
}
