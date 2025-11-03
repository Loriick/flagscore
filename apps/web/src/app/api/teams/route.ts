import { NextRequest, NextResponse } from "next/server";

import { syncTeamsFromFFFA } from "../../../lib/fffa-sync";
import { SupabaseService } from "../../../lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") || "rankings";

    console.log(
      `🔄 Synchronisation des équipes depuis ${source === "fffa" ? "la FFFA" : "les classements"}...`
    );

    const teams =
      source === "fffa"
        ? await syncTeamsFromFFFA()
        : await SupabaseService.syncTeamsFromRankings();

    return NextResponse.json({
      success: true,
      message: `${teams.length} équipes synchronisées avec succès`,
      data: teams,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation des équipes:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la synchronisation des équipes",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search");
    const poolId = searchParams.get("poolId");
    const championshipId = searchParams.get("championshipId");

    const teams = await SupabaseService.getTeams(
      searchTerm || undefined,
      poolId ? parseInt(poolId) : undefined,
      championshipId ? parseInt(championshipId) : undefined
    );

    return NextResponse.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des équipes:", error);

    // Vérifier si c'est une erreur de table manquante
    if (
      error instanceof Error &&
      error.message.includes("Could not find the table")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Table teams n'existe pas dans Supabase",
          error:
            "La table 'teams' doit être créée avant de pouvoir rechercher des équipes",
          suggestion:
            "Exécuter le script SQL de migration pour créer la table teams",
          action:
            "Voir /test-teams-sync pour créer la table et synchroniser les données",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la récupération des équipes",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
