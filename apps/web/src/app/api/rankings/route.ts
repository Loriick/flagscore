import { NextRequest, NextResponse } from "next/server";

import { Ranking } from "@flagscore/shared";

import {
  createOptimizedResponse,
  createErrorResponse,
} from "@/lib/compression";
import logger from "@/lib/logger";
import { withMonitoring } from "@/lib/monitoring";
import {
  createRateLimit,
  rateLimitConfigs,
  getRateLimitHeaders,
  isRateLimited,
} from "@/lib/rate-limit";

// Cache for rankings (5 minutes)
const rankingsCache = new Map<string, { data: Ranking[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting for rankings
const rateLimit = createRateLimit(rateLimitConfigs.dataApi);

async function handleRankings(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitResult = rateLimit(request);
    if (isRateLimited(rateLimitResult)) {
      logger.warn("RANKINGS_API_RATE_LIMITED", {
        ip: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        timestamp: new Date(),
      });

      return NextResponse.json(
        { error: rateLimitResult.message },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get("poolId");

    if (!poolId) {
      logger.warn("RANKINGS_API_MISSING_POOL_ID", {
        url: request.url,
        timestamp: new Date(),
      });
      return createErrorResponse("poolId est requis", 400);
    }

    const poolIdNum = Number(poolId);
    if (isNaN(poolIdNum)) {
      logger.warn("RANKINGS_API_INVALID_POOL_ID", {
        poolId,
        url: request.url,
        timestamp: new Date(),
      });
      return createErrorResponse("poolId doit être un nombre valide", 400);
    }

    // Check cache
    const cacheKey = `rankings-${poolId}`;
    const cached = rankingsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info("RANKINGS_API_CACHE_HIT", {
        poolId: poolIdNum,
        timestamp: new Date(),
      });

      const response = createOptimizedResponse(
        {
          rankings: cached.data,
          cached: true,
          timestamp: cached.timestamp,
        },
        { cacheMaxAge: 300 }
      );

      // Add rate limiting headers
      Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(
        ([key, value]) => {
          response.headers.set(key, value);
        }
      );

      return response;
    }

    // Get fresh data
    logger.info("RANKINGS_API_FETCH_START", {
      poolId: poolIdNum,
      timestamp: new Date(),
    });

    let rankingsData: Ranking[] = [];
    try {
      // Call FFFA API directly using the request URL to avoid environment variable issues
      const requestUrl = new URL(request.url);
      const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

      const response = await fetch(
        `${baseUrl}/api/fffa/flag?resource=rankings&args[]=${poolIdNum}`,
        {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `FFFA API error ${response.status}: ${response.statusText}`
        );
      }

      rankingsData = await response.json();
    } catch (error) {
      logger.error("RANKINGS_API_FETCH_ERROR", {
        poolId: poolIdNum,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      });

      // Return empty array instead of throwing
      return createOptimizedResponse(
        {
          rankings: [],
          cached: false,
          timestamp: Date.now(),
          error: "Unable to fetch rankings data",
        },
        { cacheMaxAge: 60 } // Cache error for 1 minute
      );
    }

    // Cache the data
    rankingsCache.set(cacheKey, {
      data: rankingsData,
      timestamp: Date.now(),
    });

    logger.info("RANKINGS_API_FETCH_SUCCESS", {
      poolId: poolIdNum,
      count: rankingsData.length,
      timestamp: new Date(),
    });

    const response = createOptimizedResponse(
      {
        rankings: rankingsData,
        cached: false,
        timestamp: Date.now(),
      },
      { cacheMaxAge: 300 }
    );

    // Add rate limiting headers
    Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(
      ([key, value]) => {
        response.headers.set(key, value);
      }
    );

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";

    logger.error("RANKINGS_API_FETCH_ERROR", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        error: `Erreur lors du chargement des classements: ${errorMessage}`,
        rankings: [],
      },
      { status: 500 }
    );
  }
}

export const GET = withMonitoring(
  handleRankings as (req: NextRequest) => Promise<NextResponse>
);
