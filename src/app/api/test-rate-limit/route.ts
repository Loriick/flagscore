import { NextRequest, NextResponse } from "next/server";
import {
  createRateLimit,
  rateLimitConfigs,
  getRateLimitHeaders,
  isRateLimited,
} from "@/src/lib/rate-limit";

// Rate limiting très strict pour tester
const rateLimit = createRateLimit({
  windowMs: 10 * 1000, // 10 secondes
  maxRequests: 3, // 3 requêtes max
  message: "Rate limit atteint pour le test",
});

export async function GET(request: NextRequest) {
  try {
    // Vérifier le rate limiting
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
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors du test de rate limiting" },
      { status: 500 }
    );
  }
}
