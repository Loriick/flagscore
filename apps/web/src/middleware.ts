import { NextRequest, NextResponse } from "next/server";

// Simplified middleware for Vercel compatibility
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block development-only pages in production
  const developmentOnlyPages = [
    "/monitoring",
    "/logs-monitor",
    "/test-teams-sync",
    "/create-teams-table",
    "/quick-setup",
  ];

  if (
    process.env.NODE_ENV === "production" &&
    developmentOnlyPages.includes(pathname)
  ) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  // Create response
  const response = NextResponse.next();

  // Add basic security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

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
