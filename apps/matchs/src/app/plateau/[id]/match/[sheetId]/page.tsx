import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  idInput,
  isWithinEditWindow,
  loadSheet,
  REQUIRED_SIGNATURES,
  ROLE_LABEL,
  teamLabel,
} from "@flagscore/core/sheets";
import { getSupabaseAdmin } from "@flagscore/core/supabase-admin";

import { assignedPlateau, requireDelegate } from "@/lib/access";
import { SheetEditor } from "@/components/SheetEditor";

export const metadata: Metadata = { title: "Feuille de match" };

export default async function SheetPage({
  params,
}: {
  params: Promise<{ id: string; sheetId: string }>;
}) {
  const session = await requireDelegate();
  const { id, sheetId } = await params;
  const plateauId = idInput.safeParse(id).data;
  const parsedSheetId = idInput.safeParse(sheetId).data;
  if (!plateauId || !parsedSheetId) notFound();
  const plateau = await assignedPlateau(session, plateauId);
  if (!plateau) notFound();
  const bundle = await loadSheet(getSupabaseAdmin(), parsedSheetId);
  if (!bundle || bundle.plateau.id !== plateau.id) notFound();

  const { row, sheet } = bundle;
  const teams = {
    home: teamLabel(row.team_home),
    away: teamLabel(row.team_away),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-5 pb-24 sm:px-6 sm:pt-10">
      <Link
        href={`/plateau/${plateau.id}`}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-stone hover:text-chalk"
      >
        ← Matchs du plateau
      </Link>
      <h1 className="font-score mt-2 mb-6 text-4xl leading-none font-black text-chalk">
        {teams.home} – {teams.away}
      </h1>
      <SheetEditor
        editable={isWithinEditWindow(plateau.date)}
        sheet={{
          id: row.id,
          status: sheet.status,
          result: sheet.result,
          teams,
          signatures: sheet.signatures,
          injuries: bundle.injuries.map(i => ({
            id: i.id,
            side: i.side,
            playerName: i.player_name,
            jerseyNumber: i.jersey_number,
            moment: i.moment,
          })),
          required: REQUIRED_SIGNATURES,
          roleLabel: ROLE_LABEL,
        }}
      />
    </div>
  );
}
