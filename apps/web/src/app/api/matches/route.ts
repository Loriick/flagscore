import { NextRequest } from "next/server";

import { Match } from "../../types";

import {
  createOptimizedResponse,
  createErrorResponse,
} from "@/lib/compression";
import { getDays, getMatches } from "@/lib/fffa-api";

// Match cache (3 minutes - more frequent than rankings)
const matchesCache = new Map<string, { data: Match[]; timestamp: number }>();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get("poolId");
    const dayId = searchParams.get("dayId");

    if (!poolId && !dayId) {
      return createErrorResponse("poolId ou dayId est requis", 400);
    }

    // Resolve effective day id if only poolId is provided
    let effectiveDayId: number | null = null;
    if (dayId) {
      effectiveDayId = Number(dayId);
    } else if (poolId) {
      try {
        const days = await getDays(Number(poolId));
        effectiveDayId = days[0]?.id || null;
      } catch {
        effectiveDayId = null;
      }
    }

    // Check cache (key based on day if available)
    const cacheKey = effectiveDayId
      ? `matches-day-${effectiveDayId}`
      : `matches-pool-${poolId}`;
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
    let matchesData: Match[] = [];
    try {
      if (effectiveDayId) {
        matchesData = await getMatches(effectiveDayId);
      } else {
        // If no day could be resolved, return empty
        matchesData = [];
      }
    } catch (error) {
      console.error("Error fetching matches:", error);

      // Return empty array instead of throwing
      return createOptimizedResponse(
        {
          matches: [],
          cached: false,
          timestamp: Date.now(),
          error: "Unable to fetch matches data",
        },
        { cacheMaxAge: 60 } // Cache error for 1 minute
      );
    }

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
