import { NextRequest, NextResponse } from "next/server";

import logger, { logMetric } from "@/lib/logger";
import { withMonitoring } from "@/lib/monitoring";
import {
  createRateLimit,
  rateLimitConfigs,
  getRateLimitHeaders,
  isRateLimited,
} from "@/lib/rate-limit";

interface MetricPayload {
  metric: string;
  value: number;
  metadata?: Record<string, string>;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

interface CachedMetric extends MetricPayload {
  receivedAt: Date;
}

// Cache for metrics (in production, use Redis or database)
const metricsCache = new Map<string, CachedMetric>();

// Rate limiting for metrics (stricter)
const rateLimit = createRateLimit(rateLimitConfigs.strict);

async function handleMetrics(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Check rate limiting
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

    // Validate data
    if (!payload.metric || typeof payload.value !== "number") {
      return NextResponse.json(
        { error: "Invalid metric data" },
        { status: 400 }
      );
    }

    // Log the metric
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

    // Store in cache (in production, use a database)
    const cacheKey = `${payload.metric}_${Date.now()}`;
    metricsCache.set(cacheKey, {
      ...payload,
      receivedAt: new Date(),
    });

    // Clean cache if it becomes too large
    if (metricsCache.size > 1000) {
      const keys = Array.from(metricsCache.keys());
      keys.slice(0, 100).forEach(key => metricsCache.delete(key));
    }

    const response = NextResponse.json({
      success: true,
      message: "Metric recorded successfully",
      requestId: generateRequestId(),
    });

    // Add rate limiting headers
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

// Function to generate a request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Endpoint to retrieve metrics (for the dashboard)
async function getMetrics(req: NextRequest) {
  try {
    // Check rate limiting
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

    // Filter by metric name if specified
    if (metricName) {
      metrics = metrics.filter(m => m.metric === metricName);
    }

    // Limit the number of results
    metrics = metrics.slice(-limit);

    // Calculate statistics
    const stats = calculateMetricsStats(metrics);

    const response = NextResponse.json({
      metrics,
      stats,
      total: metrics.length,
      timestamp: new Date(),
    });

    // Add rate limiting headers
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

// Function to calculate metrics statistics
function calculateMetricsStats(metrics: CachedMetric[]) {
  if (metrics.length === 0) {
    return {
      count: 0,
      average: 0,
      min: 0,
      max: 0,
      sum: 0,
    };
  }

  const values = metrics.map(m => m.value);
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

// Export handlers with monitoring
export const POST = withMonitoring(
  handleMetrics as (req: NextRequest) => Promise<NextResponse>
);
export const GET = withMonitoring(
  getMetrics as (req: NextRequest) => Promise<NextResponse>
);
