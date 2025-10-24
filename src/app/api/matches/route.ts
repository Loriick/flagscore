import { NextRequest, NextResponse } from "next/server";

import { getMatches } from "@/src/lib/fffa-api";

// Match cache (3 minutes - more frequent than rankings)
const matchesCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get("poolId");

    if (!poolId) {
      return NextResponse.json({ error: "poolId est requis" }, { status: 400 });
    }

    // Check cache
    const cacheKey = `matches-${poolId}`;
    const cached = matchesCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        matches: cached.data,
        cached: true,
        timestamp: cached.timestamp,
      });
    }

    // Get fresh data
    const matchesData = await getMatches(Number(poolId));

    // Cache the data
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
    console.error("Error in the matches API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: `Error loading matches: ${errorMessage}`,
        matches: [],
      },
      { status: 500 }
    );
  }
}
