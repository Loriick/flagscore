import { NextRequest, NextResponse } from "next/server";
import logger, { logMetric } from "@/src/lib/logger";
import { withMonitoring } from "@/src/lib/monitoring";
import {
  createRateLimit,
  rateLimitConfigs,
  getRateLimitHeaders,
  isRateLimited,
} from "@/src/lib/rate-limit";

interface MetricPayload {
  metric: string;
  value: number;
  metadata?: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

// Cache pour les métriques (en production, utiliser Redis ou une base de données)
const metricsCache = new Map<string, any>();

// Rate limiting pour les métriques (plus strict)
const rateLimit = createRateLimit(rateLimitConfigs.strict);

async function handleMetrics(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Vérifier le rate limiting
    const rateLimitResult = rateLimit(req);
    if (isRateLimited(rateLimitResult)) {
      logger.warn("METRICS_API_RATE_LIMITED", {
        ip: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
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

    const payload: MetricPayload = await req.json();

    // Valider les données
    if (!payload.metric || typeof payload.value !== "number") {
      return NextResponse.json(
        { error: "Invalid metric data" },
        { status: 400 }
      );
    }

    // Logger la métrique
    logMetric({
      name: payload.metric,
      value: payload.value,
      tags: {
        userAgent: payload.userAgent || "unknown",
        url: payload.url || "unknown",
        ...payload.metadata,
      },
      timestamp: payload.timestamp,
    });

    // Stocker dans le cache (en production, utiliser une base de données)
    const cacheKey = `${payload.metric}_${Date.now()}`;
    metricsCache.set(cacheKey, {
      ...payload,
      receivedAt: new Date(),
    });

    // Nettoyer le cache si il devient trop grand
    if (metricsCache.size > 1000) {
      const keys = Array.from(metricsCache.keys());
      keys.slice(0, 100).forEach((key) => metricsCache.delete(key));
    }

    const response = NextResponse.json({
      success: true,
      message: "Metric recorded successfully",
      requestId: generateRequestId(),
    });

    // Ajouter les headers de rate limiting
    Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(
      ([key, value]) => {
        response.headers.set(key, value);
      }
    );

    return response;
  } catch (error) {
    logger.error("METRICS_API_ERROR", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Fonction pour générer un ID de requête
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Endpoint pour récupérer les métriques (pour le dashboard)
async function getMetrics(req: NextRequest) {
  try {
    // Vérifier le rate limiting
    const rateLimitResult = rateLimit(req);
    if (isRateLimited(rateLimitResult)) {
      logger.warn("GET_METRICS_RATE_LIMITED", {
        ip: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
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

    const { searchParams } = new URL(req.url);
    const metricName = searchParams.get("metric");
    const limit = parseInt(searchParams.get("limit") || "100");

    let metrics = Array.from(metricsCache.values());

    // Filtrer par nom de métrique si spécifié
    if (metricName) {
      metrics = metrics.filter((m) => m.metric === metricName);
    }

    // Limiter le nombre de résultats
    metrics = metrics.slice(-limit);

    // Calculer les statistiques
    const stats = calculateMetricsStats(metrics);

    const response = NextResponse.json({
      metrics,
      stats,
      total: metrics.length,
      timestamp: new Date(),
    });

    // Ajouter les headers de rate limiting
    Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(
      ([key, value]) => {
        response.headers.set(key, value);
      }
    );

    return response;
  } catch (error) {
    logger.error("GET_METRICS_ERROR", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Fonction pour calculer les statistiques des métriques
function calculateMetricsStats(metrics: any[]) {
  if (metrics.length === 0) {
    return {
      count: 0,
      average: 0,
      min: 0,
      max: 0,
      sum: 0,
    };
  }

  const values = metrics.map((m) => m.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const average = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    count: values.length,
    average: Math.round(average * 100) / 100,
    min,
    max,
    sum,
  };
}

// Exporter les handlers avec monitoring
export const POST = withMonitoring(handleMetrics as any);
export const GET = withMonitoring(getMetrics as any);
