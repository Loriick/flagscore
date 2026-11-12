import { NextRequest, NextResponse } from "next/server";

import {
  collectFinishedRuns,
  processPendingPosts,
  reconcileEvents,
  startCollection,
} from "@/lib/social/pipeline";
import { todayInParis } from "@/lib/social/schedule";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
// Lecture des visuels par Claude : on laisse le temps de traiter un lot.
export const maxDuration = 300;

/**
 * Import des scores publiés sur Instagram.
 *
 *  ?step=start    lance la collecte Apify, seulement les jours qui suivent
 *                 une journée de compétition (sauf si &force=1)
 *  ?step=process  récupère les collectes terminées, lit les posts en attente
 *                 avec Claude, rapproche et enregistre les scores
 *  (sans step)    les deux
 *
 * Appelée par les Schedules Vercel (voir vercel.json, heure de Paris) avec
 * `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/social] CRON_SECRET non configuré");
    return NextResponse.json(
      { ok: false, message: "CRON_SECRET non configuré" },
      { status: 500 }
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    console.warn(
      "[cron/social] appel refusé : CRON_SECRET absent ou différent"
    );
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const params = request.nextUrl.searchParams;
  const step = params.get("step") ?? "all";
  const force = params.get("force") === "1";
  // Marge avant la limite de 300 s pour finir proprement le lot en cours.
  const deadline = Date.now() + 200_000;

  try {
    const db = getSupabaseAdmin();
    const result: Record<string, unknown> = { step };

    if (step === "start" || step === "all") {
      result.start = await startCollection(db, {
        today: todayInParis(),
        force,
      });
    }

    if (step === "process" || step === "all") {
      result.collect = await collectFinishedRuns(db);
      const processed = await processPendingPosts(db, { deadline });
      result.process = processed;
      result.reconcile = await reconcileEvents(db, processed.events);
    }

    // Résumé dans les journaux Vercel, pour suivre chaque exécution.
    console.log("[cron/social]", JSON.stringify(result));
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron/social]", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
