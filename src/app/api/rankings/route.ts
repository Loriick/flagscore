import { NextRequest, NextResponse } from "next/server";

import { getRankings } from "@/src/lib/fffa-api";
import logger from "@/src/lib/logger";
import { withMonitoring } from "@/src/lib/monitoring";
import {
  createRateLimit,
  rateLimitConfigs,
  getRateLimitHeaders,
  isRateLimited,
} from "@/src/lib/rate-limit";

// Cache des classements (5 minutes)
const rankingsCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting pour les classements
const rateLimit = createRateLimit(rateLimitConfigs.dataApi);

async function handleRankings(request: NextRequest) {
  try {
    // Vérifier le rate limiting
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
      return NextResponse.json({ error: "poolId est requis" }, { status: 400 });
    }

    const poolIdNum = Number(poolId);
    if (isNaN(poolIdNum)) {
      logger.warn("RANKINGS_API_INVALID_POOL_ID", {
        poolId,
        url: request.url,
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "poolId doit être un nombre valide" },
        { status: 400 }
      );
    }

    // Vérifier le cache
    const cacheKey = `rankings-${poolId}`;
    const cached = rankingsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info("RANKINGS_API_CACHE_HIT", {
        poolId: poolIdNum,
        timestamp: new Date(),
      });

      const response = NextResponse.json({
        rankings: cached.data,
        cached: true,
        timestamp: cached.timestamp,
      });

      // Ajouter les headers de rate limiting
      Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(
        ([key, value]) => {
          response.headers.set(key, value);
        }
      );

      return response;
    }

    // Récupérer les données fraîches
    logger.info("RANKINGS_API_FETCH_START", {
      poolId: poolIdNum,
      timestamp: new Date(),
    });

    const rankingsData = await getRankings(poolIdNum);

    // Mettre en cache
    rankingsCache.set(cacheKey, {
      data: rankingsData,
      timestamp: Date.now(),
    });

    logger.info("RANKINGS_API_FETCH_SUCCESS", {
      poolId: poolIdNum,
      count: rankingsData.length,
      timestamp: new Date(),
    });

    const response = NextResponse.json({
      rankings: rankingsData,
      cached: false,
      timestamp: Date.now(),
    });

    // Ajouter les headers de rate limiting
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

export const GET = withMonitoring(handleRankings as any);
