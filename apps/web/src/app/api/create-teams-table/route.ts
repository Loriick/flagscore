import { NextResponse } from "next/server";

import { supabase } from "../../../lib/supabase";

export async function POST() {
  try {
    console.log("🔧 Création de la table teams...");

    // Script SQL pour créer la table teams
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        pool_id INTEGER NOT NULL REFERENCES pools(id),
        championship_id INTEGER NOT NULL REFERENCES championships(id),
        season TEXT NOT NULL,
        total_matches INTEGER DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        total_draws INTEGER DEFAULT 0,
        total_losses INTEGER DEFAULT 0,
        total_goals_for INTEGER DEFAULT 0,
        total_goals_against INTEGER DEFAULT 0,
        total_goal_difference INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        best_position INTEGER DEFAULT 0,
        worst_position INTEGER DEFAULT 0,
        current_position INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Exécuter le script SQL
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: createTableSQL,
    });

    if (error) {
      console.error("❌ Erreur lors de la création de la table:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Erreur lors de la création de la table teams",
          error: error.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Table teams créée avec succès");

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
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("🔍 Vérification de l'existence de la table teams...");

    // Tester si la table existe
    const { data, error } = await supabase
      .from("teams")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Table teams n'existe pas:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Table teams n'existe pas",
          error: error.message,
          code: error.code,
          suggestion: "Utiliser POST pour créer la table",
        },
        { status: 404 }
      );
    }

    console.log("✅ Table teams existe");

    return NextResponse.json({
      success: true,
      message: "Table teams existe",
      teamsCount: data?.length || 0,
    });
  } catch (error) {
    console.error("❌ Erreur générale:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la vérification de la table teams",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
