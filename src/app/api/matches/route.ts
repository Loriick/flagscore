import { NextRequest } from "next/server";

import { Match } from "../../types";

import {
  createOptimizedResponse,
  createErrorResponse,
} from "@/src/lib/compression";
import { getMatches } from "@/src/lib/fffa-api";

// Match cache (3 minutes - more frequent than rankings)
const matchesCache = new Map<string, { data: Match[]; timestamp: number }>();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get("poolId");

    if (!poolId) {
      return createErrorResponse("poolId est requis", 400);
    }

    // Check cache
    const cacheKey = `matches-${poolId}`;
    const cached = matchesCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return createOptimizedResponse(
        {
          matches: cached.data,
          cached: true,
          timestamp: cached.timestamp,
        },
        { cacheMaxAge: 180 } // 3 minutes
      );
    }

    // Get fresh data
    const matchesData = await getMatches(Number(poolId));

    // Cache the data
    matchesCache.set(cacheKey, {
      data: matchesData,
      timestamp: Date.now(),
    });

    return createOptimizedResponse(
      {
        matches: matchesData,
        cached: false,
        timestamp: Date.now(),
      },
      { cacheMaxAge: 180 } // 3 minutes
    );
  } catch (error) {
    console.error("Error in the matches API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return createErrorResponse(`Error loading matches: ${errorMessage}`, 500);
  }
}
