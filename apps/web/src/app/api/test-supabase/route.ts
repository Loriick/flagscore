import { NextResponse } from "next/server";

import { supabase } from "../../../lib/supabase";

export async function GET() {
  try {
    console.log("🔍 Test de connexion Supabase...");

    // Test simple de connexion
    const { data, error } = await supabase
      .from("rankings")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Erreur de connexion Supabase",
          error: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    console.log("✅ Connexion Supabase OK");

    // Test de la table teams
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("count")
        .limit(1);

      if (teamsError) {
        console.error("❌ Table teams n'existe pas:", teamsError);
        return NextResponse.json(
          {
            success: false,
            message: "Table teams n'existe pas",
            error: teamsError.message,
            code: teamsError.code,
            suggestion:
              "Exécuter le script SQL de migration pour créer la table teams",
          },
          { status: 500 }
        );
      }

      console.log("✅ Table teams existe");

      return NextResponse.json({
        success: true,
        message: "Connexion Supabase OK et table teams existe",
        rankingsCount: data?.length || 0,
        teamsCount: teamsData?.length || 0,
      });
    } catch (teamsErr) {
      console.error("❌ Erreur lors du test de la table teams:", teamsErr);
      return NextResponse.json(
        {
          success: false,
          message: "Erreur lors du test de la table teams",
          error:
            teamsErr instanceof Error ? teamsErr.message : "Erreur inconnue",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Erreur générale:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur générale",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
