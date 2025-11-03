import { NextRequest, NextResponse } from "next/server";

import { SupabaseService } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function unauthorized(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 401 });
}

export async function GET(request: NextRequest) {
  // Simple auth for scheduled calls
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") || "";
  if (secret && authHeader !== `Bearer ${secret}`) {
    return unauthorized("Unauthorized cron call");
  }

  try {
    const origin = new URL(request.url);
    const baseUrl = `${origin.protocol}//${origin.host}`;

    // Get latest championships (defaults to all, ordered desc)
    const championships = await SupabaseService.getChampionships();

    // Date d'hier (minuit) pour filtrer les journées terminées
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    let syncedPools = 0;
    let skippedPools = 0;
    let errors: Array<{ poolId: number; error: string }> = [];

    for (const c of championships) {
      const pools = await SupabaseService.getPoolsByChampionship(c.id);
      for (const p of pools) {
        try {
          // Récupérer les jours de cette poule
          const days = await SupabaseService.getDaysByPool(p.id);

          // Vérifier si au moins un jour est terminé (date <= hier)
          const hasFinishedDays = days.some(day => {
            const dayDate = new Date(day.date);
            dayDate.setHours(0, 0, 0, 0);
            return dayDate <= yesterday;
          });

          // Ne synchroniser que si la poule a des journées terminées
          if (hasFinishedDays) {
            await fetch(`${baseUrl}/api/sync`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "smart", poolId: p.id }),
              cache: "no-store",
            });
            syncedPools += 1;
          } else {
            skippedPools += 1;
          }
        } catch (e) {
          errors.push({
            poolId: p.id,
            error: e instanceof Error ? e.message : "Unknown error",
          });
        }
      }
    }

    // Synchroniser les équipes depuis les classements après avoir sync les matchs
    let teamsSyncResult: {
      success: boolean;
      message?: string;
      error?: string;
    } = {
      success: false,
    };
    try {
      const teamsResponse = await fetch(`${baseUrl}/api/teams`, {
        method: "POST",
        cache: "no-store",
      });
      const teamsData = await teamsResponse.json();
      teamsSyncResult = {
        success: teamsData.success,
        message: teamsData.message,
      };
    } catch (e) {
      teamsSyncResult = {
        success: false,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }

    return NextResponse.json({
      ok: true,
      syncedPools,
      skippedPools,
      teamsSync: teamsSyncResult,
      errors,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
