import { NextRequest, NextResponse } from "next/server";

import { securityConfig, generateCSPString } from "@/src/lib/security";

// Security headers with dynamic CSP
const SECURITY_HEADERS = {
  "Content-Security-Policy": generateCSPString(),
  "X-Frame-Options": securityConfig.headers["X-Frame-Options"],
  "X-Content-Type-Options": securityConfig.headers["X-Content-Type-Options"],
  "Referrer-Policy": securityConfig.headers["Referrer-Policy"],
  "Permissions-Policy": securityConfig.headers["Permissions-Policy"],
  "X-XSS-Protection": securityConfig.headers["X-XSS-Protection"],
  "Strict-Transport-Security":
    securityConfig.headers["Strict-Transport-Security"],
};

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = securityConfig.rateLimit.api.windowMs;
const RATE_LIMIT_MAX_REQUESTS =
  process.env.NODE_ENV === "development"
    ? 1000 // In dev: 1000 requests per window
    : securityConfig.rateLimit.api.maxRequests;

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";
  return ip;
}

function checkRateLimit(request: NextRequest): boolean {
  const key = getRateLimitKey(request);
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// Modern middleware with export default
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting only to API routes
  if (pathname.startsWith("/api/")) {
    if (!checkRateLimit(request)) {
      return NextResponse.json(
        { error: securityConfig.rateLimit.api.message },
        { status: 429 }
      );
    }
  }

  // Create response with security headers
  const response = NextResponse.next();

  // Add all security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Specific headers for API routes
  if (pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Apply middleware to all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
