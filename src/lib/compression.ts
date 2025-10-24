import { NextResponse } from "next/server";

// Compression utility for API responses
export function compressResponse(data: unknown, status = 200): NextResponse {
  const response = NextResponse.json(data, { status });

  // Add compression headers
  response.headers.set("Content-Encoding", "gzip");
  response.headers.set("Vary", "Accept-Encoding");

  // Add cache headers for successful responses
  if (status === 200) {
    response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300"); // 5 minutes
    response.headers.set("ETag", generateETag(JSON.stringify(data)));
  }

  return response;
}

// Generate ETag for caching
function generateETag(data: string): string {
  // Simple hash function for ETag generation
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(16)}"`;
}

// Optimized response for API endpoints
export function createOptimizedResponse(
  data: unknown,
  options: {
    status?: number;
    cacheMaxAge?: number;
    compress?: boolean;
  } = {}
): NextResponse {
  const { status = 200, cacheMaxAge = 300, compress = false } = options; // Désactivé par défaut

  const response = NextResponse.json(data, { status });

  // Add performance headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");

  // Add cache headers for successful responses
  if (status === 200) {
    response.headers.set(
      "Cache-Control",
      `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}`
    );
    response.headers.set("ETag", generateETag(JSON.stringify(data)));

    // Add compression if enabled (only in production)
    if (compress && process.env.NODE_ENV === "production") {
      response.headers.set("Content-Encoding", "gzip");
      response.headers.set("Vary", "Accept-Encoding");
    }
  }

  return response;
}

// Error response helper
export function createErrorResponse(
  message: string,
  status = 500
): NextResponse {
  const errorData = {
    error: message,
    timestamp: new Date().toISOString(),
    status,
  };

  const response = NextResponse.json(errorData, { status });

  // Add error-specific headers
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
}
