import "server-only";

import { requireRole, type Session } from "@flagscore/core/auth/server";
import {
  isWithinEditWindow,
  loadSheet,
  PLATEAU_COLUMNS,
  type PlateauRow,
  type SheetBundle,
} from "@flagscore/core/sheets";
import { getSupabaseAdmin } from "@flagscore/core/supabase-admin";

export class AccessError extends Error {}

export const requireDelegate = () => requireRole(["delegate", "admin"]);

/** Plateau seulement si le compte y est affecté, sinon null. */
export async function assignedPlateau(
  session: Session,
  plateauId: string
): Promise<PlateauRow | null> {
  const db = getSupabaseAdmin();
  const { data: assignment, error } = await db
    .from("delegate_assignments")
    .select("plateau_id")
    .eq("plateau_id", plateauId)
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!assignment) return null;
  const { data } = await db
    .from("plateaux")
    .select(PLATEAU_COLUMNS)
    .eq("id", plateauId)
    .single();
  return data as PlateauRow;
}

/**
 * Garde de toute écriture : affectation au plateau ET fenêtre de saisie
 * (veille au surlendemain, heure de Paris).
 */
export async function editablePlateau(session: Session, plateauId: string) {
  const plateau = await assignedPlateau(session, plateauId);
  if (!plateau) throw new AccessError("Tu n'es pas délégué sur ce plateau.");
  if (!isWithinEditWindow(plateau.date)) {
    throw new AccessError(
      "Ce plateau n'est modifiable que de la veille au surlendemain du plateau."
    );
  }
  return plateau;
}

export async function editableSheet(
  session: Session,
  sheetId: string
): Promise<SheetBundle> {
  const bundle = await loadSheet(getSupabaseAdmin(), sheetId);
  if (!bundle) throw new AccessError("Feuille introuvable.");
  await editablePlateau(session, bundle.plateau.id);
  return bundle;
}
