import { NextRequest, NextResponse } from "next/server";

import {
  createRateLimit,
  getRateLimitHeaders,
  isRateLimited,
} from "@/src/lib/rate-limit";

// Very strict rate limiting for testing
const rateLimit = createRateLimit({
  windowMs: 10 * 1000, // 10 secondes
  maxRequests: 3, // 3 requests max
  message: "Rate limit atteint pour le test",
});

export async function GET(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitResult = rateLimit(request);
    if (isRateLimited(rateLimitResult)) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    return NextResponse.json(
      {
        message: "Test de rate limiting réussi",
        timestamp: new Date().toISOString(),
        remaining: rateLimitResult.remaining,
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du test de rate limiting" },
      { status: 500 }
    );
  }
}
