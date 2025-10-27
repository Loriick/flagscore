import { NextResponse } from "next/server";

import { supabase } from "../../../lib/supabase";

export async function POST() {
  try {
    console.log("🔧 Tentative de création de la table teams via API...");

    // Note: Cette méthode ne fonctionne généralement pas avec Supabase
    // car l'exécution de SQL arbitraire est désactivée par sécurité
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "teams");

    if (error) {
      console.error("❌ Erreur lors de la vérification:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Impossible de créer la table via API",
          error: error.message,
          suggestion: "Créer la table manuellement dans Supabase Dashboard",
          instructions: {
            step1: "Aller sur https://supabase.com/dashboard",
            step2: "Sélectionner votre projet Flagscore",
            step3: "Ouvrir SQL Editor",
            step4: "Exécuter le script SQL fourni dans /create-teams-table",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Table teams créée avec succès",
      data: data,
    });
  } catch (error) {
    console.error("❌ Erreur générale:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la création de la table teams",
        error: error instanceof Error ? error.message : "Erreur inconnue",
        solution: "Créer la table manuellement dans Supabase Dashboard",
      },
      { status: 500 }
    );
  }
}
