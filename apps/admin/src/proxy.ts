import type { NextRequest } from "next/server";

import { refreshSession } from "@flagscore/core/auth/proxy";

// Le cron se protège lui-même avec CRON_SECRET.
const PUBLIC = ["/login", "/auth/", "/api/cron/"];

export function proxy(request: NextRequest) {
  return refreshSession(request, pathname =>
    PUBLIC.some(p => pathname.startsWith(p))
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
