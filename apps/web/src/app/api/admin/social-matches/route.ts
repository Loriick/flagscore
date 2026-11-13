import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { CLUB_INSTAGRAM, clubName } from "@/lib/social/data/pools-2026-2027";
import { normalizeHandle } from "@/lib/social/teams";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * Validation des scores relevés sur Instagram (page /admin/scores).
 *
 *  GET  ?view=pending    scores à vérifier ou en conflit, pas encore revus
 *       ?view=published  scores affichés automatiquement (pour en rejeter un)
 *       ?view=reviewed   décisions déjà prises
 *  POST { match_key, action: "approve" | "reject" | "reset",
 *         score_home?, score_away? }
 *
 * Protégé par `Authorization: Bearer $ADMIN_SECRET`.
 */

function authorized(request: NextRequest): NextResponse | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_SECRET non configuré" },
      { status: 500 }
    );
  }
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json(
      { ok: false, message: "Mot de passe incorrect" },
      { status: 401 }
    );
  }
  return null;
}

const MATCH_COLUMNS =
  "match_key, event_key, competition, stage, event_start, team_home, team_away, score_home, score_away, status, auto_apply, review, review_score_home, review_score_away, reviewed_at, reason, accounts, observation_ids";

/** Comptes du club d'une équipe : « Molosses B (Asnières) · Fém. » → Molosses (Asnières). */
function clubHandles(ref: string): string[] {
  const m = ref.match(/^(.*) \(([^)]*)\)/);
  if (!m) return [];
  return (CLUB_INSTAGRAM[`${clubName(m[1])} (${m[2]})`] ?? []).map(
    normalizeHandle
  );
}

/**
 * Score d'un post remis dans l'ordre domicile / extérieur, d'après le club
 * qui l'a publié (null si le compte n'est celui d'aucune des deux équipes).
 */
function orient(
  o: ObservationRow,
  home: string,
  away: string
): { home_score: number; away_score: number } | null {
  const account = normalizeHandle(o.account);
  const isHome = clubHandles(home).includes(account);
  const isAway = clubHandles(away).includes(account);
  if (isHome === isAway) return null;
  return isHome
    ? { home_score: o.team_score, away_score: o.opponent_score }
    : { home_score: o.opponent_score, away_score: o.team_score };
}

interface ObservationRow {
  id: string;
  post_id: string;
  account: string;
  team_raw: string;
  opponent_raw: string;
  team_score: number;
  opponent_score: number;
  confidence: number;
}

export async function GET(request: NextRequest) {
  const denied = authorized(request);
  if (denied) return denied;

  const view = request.nextUrl.searchParams.get("view") ?? "pending";
  const db = getSupabaseAdmin();
  let query = db
    .from("social_matches")
    .select(MATCH_COLUMNS)
    .order("event_start", { ascending: false })
    .order("match_key");
  if (view === "published") {
    query = query.eq("auto_apply", true).is("review", null);
  } else if (view === "reviewed") {
    query = query.not("review", "is", null);
  } else {
    query = query.eq("auto_apply", false).is("review", null);
  }

  const { data: matches, error } = await query;
  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }

  // Ce que chaque club a publié, avec le lien vers son post.
  const ids = [...new Set(matches.flatMap(m => m.observation_ids ?? []))];
  const observations: ObservationRow[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error: obsError } = await db
      .from("score_observations")
      .select(
        "id, post_id, account, team_raw, opponent_raw, team_score, opponent_score, confidence"
      )
      .in("id", ids.slice(i, i + 200));
    if (obsError) {
      return NextResponse.json(
        { ok: false, message: obsError.message },
        { status: 500 }
      );
    }
    observations.push(...(data as ObservationRow[]));
  }

  const postIds = [...new Set(observations.map(o => o.post_id))];
  const permalinks = new Map<string, string>();
  for (let i = 0; i < postIds.length; i += 200) {
    const { data } = await db
      .from("social_posts")
      .select("id, permalink")
      .in("id", postIds.slice(i, i + 200));
    for (const p of data ?? []) permalinks.set(p.id, p.permalink);
  }

  const byId = new Map(observations.map(o => [o.id, o]));
  return NextResponse.json({
    ok: true,
    matches: matches.map(m => ({
      ...m,
      evidence: (m.observation_ids ?? []).flatMap((id: string) => {
        const o = byId.get(id);
        return o
          ? [
              {
                ...o,
                permalink: permalinks.get(o.post_id) ?? null,
                oriented: orient(o, m.team_home, m.team_away),
              },
            ]
          : [];
      }),
    })),
  });
}

const isScore = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 300;

export async function POST(request: NextRequest) {
  const denied = authorized(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    match_key?: unknown;
    action?: unknown;
    score_home?: unknown;
    score_away?: unknown;
  } | null;
  const matchKey = typeof body?.match_key === "string" ? body.match_key : "";
  const action = body?.action;
  if (!matchKey || !["approve", "reject", "reset"].includes(String(action))) {
    return NextResponse.json(
      { ok: false, message: "Requête invalide" },
      { status: 400 }
    );
  }

  let update: Record<string, unknown>;
  if (action === "approve") {
    if (!isScore(body?.score_home) || !isScore(body?.score_away)) {
      return NextResponse.json(
        { ok: false, message: "Scores invalides" },
        { status: 400 }
      );
    }
    update = {
      review: "approved",
      review_score_home: body.score_home,
      review_score_away: body.score_away,
    };
  } else if (action === "reject") {
    update = {
      review: "rejected",
      review_score_home: null,
      review_score_away: null,
    };
  } else {
    update = { review: null, review_score_home: null, review_score_away: null };
  }

  const { data, error } = await getSupabaseAdmin()
    .from("social_matches")
    .update({ ...update, reviewed_at: action === "reset" ? null : new Date() })
    .eq("match_key", matchKey)
    .select("match_key");
  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }
  if (!data?.length) {
    return NextResponse.json(
      { ok: false, message: "Match introuvable" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
