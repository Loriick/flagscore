import { NextRequest, NextResponse } from "next/server";

import {
  createRateLimit,
  rateLimitConfigs,
  getRateLimitHeaders,
  isRateLimited,
} from "@/src/lib/rate-limit";

// Rate limiting pour les tests
const rateLimit = createRateLimit(rateLimitConfigs.strict);

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
        message: "Test de sécurité réussi",
        timestamp: new Date().toISOString(),
        headers: {
          csp: request.headers.get("content-security-policy") !== null,
          frameOptions: request.headers.get("x-frame-options"),
          contentTypeOptions: request.headers.get("x-content-type-options"),
        },
      },
      {
        headers: getRateLimitHeaders(rateLimitResult),
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du test de sécurité" },
      { status: 500 }
    );
  }
}
