import { NextRequest, NextResponse } from "next/server";

import { getRankings } from "@/src/lib/fffa-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get("poolId");

    if (!poolId) {
      return NextResponse.json({ error: "poolId est requis" }, { status: 400 });
    }

    const rankingsData = await getRankings(Number(poolId));

    return NextResponse.json({ rankings: rankingsData });
  } catch (error) {
    console.error("Erreur dans l'API rankings:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";

    return NextResponse.json(
      {
        error: `Erreur lors du chargement des classements: ${errorMessage}`,
        rankings: [],
      },
      { status: 500 }
    );
  }
}
