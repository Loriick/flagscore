import { NextRequest, NextResponse } from "next/server";

import { getMatches } from "@/src/lib/fffa-api";

// Cache des matchs (3 minutes - plus fréquent que les classements)
const matchesCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get("poolId");

    if (!poolId) {
      return NextResponse.json({ error: "poolId est requis" }, { status: 400 });
    }

    // Vérifier le cache
    const cacheKey = `matches-${poolId}`;
    const cached = matchesCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        matches: cached.data,
        cached: true,
        timestamp: cached.timestamp,
      });
    }

    // Récupérer les données fraîches
    const matchesData = await getMatches(Number(poolId));

    // Mettre en cache
    matchesCache.set(cacheKey, {
      data: matchesData,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      matches: matchesData,
      cached: false,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Erreur dans l'API matches:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";

    return NextResponse.json(
      {
        error: `Erreur lors du chargement des matchs: ${errorMessage}`,
        matches: [],
      },
      { status: 500 }
    );
  }
}
