import { NextRequest, NextResponse } from "next/server";

import { SupabaseService } from "../../../../lib/supabase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await context.params;

    if (!teamId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID d'équipe requis",
        },
        { status: 400 }
      );
    }

    const team = await SupabaseService.getTeamById(teamId);

    return NextResponse.json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'équipe:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la récupération de l'équipe",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
