"use server";

import type { ActionState } from "@flagscore/ui/ActionForm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  audit,
  idInput,
  injuryInput,
  newSheetInput,
  resultInput,
  saveResult,
  saveSignature,
  SheetError,
  signatureInput,
} from "@flagscore/core/sheets";
import { poolMatch } from "@flagscore/core/social/results";
import { getSupabaseAdmin } from "@flagscore/core/supabase-admin";

import {
  AccessError,
  editablePlateau,
  editableSheet,
  requireDelegate,
} from "@/lib/access";

const failure = (message: string): ActionState => ({
  status: "error",
  message,
});

/** Erreurs attendues (droits, règles de la feuille) → message ; le reste remonte. */
async function guarded(run: () => Promise<ActionState>): Promise<ActionState> {
  try {
    return await run();
  } catch (e) {
    if (e instanceof AccessError || e instanceof SheetError) {
      return failure(e.message);
    }
    throw e;
  }
}

const sheetPath = (plateauId: string, sheetId: string) =>
  `/plateau/${plateauId}/match/${sheetId}`;

export async function createSheet(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireDelegate();
  const plateauId = idInput.parse(formData.get("plateauId"));
  const parsed = newSheetInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure("Choisis deux équipes.");
  let sheetId = "";
  const state = await guarded(async () => {
    const plateau = await editablePlateau(session, plateauId);
    const match = poolMatch({
      poolId: plateau.pool_id,
      eventKey: plateau.event_key,
      teamA: parsed.data.teamA,
      teamB: parsed.data.teamB,
    });
    if (!match) return failure("Choisis deux équipes différentes de la poule.");
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("match_sheets")
      .insert({
        plateau_id: plateau.id,
        match_key: match.row.match_key,
        team_home: match.row.team_home,
        team_away: match.row.team_away,
        created_by: session.user.id,
      })
      .select("id")
      .single();
    if (error?.code === "23505") {
      return failure("Ce match a déjà une feuille sur ce plateau.");
    }
    if (error) throw new Error(error.message);
    sheetId = data.id;
    await audit(db, {
      actor: session.user.id,
      action: "sheet.create",
      entity: "match_sheet",
      entityId: data.id,
      details: { match_key: match.row.match_key },
    });
    return { status: "ok", message: "Feuille créée." };
  });
  if (!sheetId) return state;
  revalidatePath(`/plateau/${plateauId}`);
  redirect(sheetPath(plateauId, sheetId));
}

export async function setResult(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireDelegate();
  const sheetId = idInput.parse(formData.get("sheetId"));
  const parsed = resultInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure("Score invalide (entre 0 et 300).");
  return guarded(async () => {
    const bundle = await editableSheet(session, sheetId);
    await saveResult(getSupabaseAdmin(), bundle, parsed.data, session.user.id);
    revalidatePath(sheetPath(bundle.plateau.id, sheetId));
    return { status: "ok", message: "Résultat enregistré." };
  });
}

export async function sign(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireDelegate();
  const sheetId = idInput.parse(formData.get("sheetId"));
  const parsed = signatureInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure("Indique le nom et trace la signature.");
  return guarded(async () => {
    const bundle = await editableSheet(session, sheetId);
    const complete = await saveSignature(
      getSupabaseAdmin(),
      bundle,
      parsed.data,
      session.user.id
    );
    revalidatePath(sheetPath(bundle.plateau.id, sheetId));
    revalidatePath(`/plateau/${bundle.plateau.id}`);
    return {
      status: "ok",
      message: complete
        ? "Feuille signée par les deux équipes : le score est publié."
        : "Signature enregistrée.",
    };
  });
}

export async function addInjury(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireDelegate();
  const sheetId = idInput.parse(formData.get("sheetId"));
  const parsed = injuryInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failure("Indique au moins le nom du joueur.");
  return guarded(async () => {
    const bundle = await editableSheet(session, sheetId);
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("injuries")
      .insert({
        sheet_id: sheetId,
        side: parsed.data.side,
        player_name: parsed.data.playerName,
        jersey_number: parsed.data.jerseyNumber,
        moment: parsed.data.moment,
        created_by: session.user.id,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await audit(db, {
      actor: session.user.id,
      action: "injury.add",
      entity: "injury",
      entityId: data.id,
      details: { sheet_id: sheetId },
    });
    revalidatePath(sheetPath(bundle.plateau.id, sheetId));
    return { status: "ok", message: "Blessé ajouté." };
  });
}

export async function removeInjury(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireDelegate();
  const sheetId = idInput.parse(formData.get("sheetId"));
  const injuryId = idInput.parse(formData.get("injuryId"));
  return guarded(async () => {
    const bundle = await editableSheet(session, sheetId);
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("injuries")
      .delete()
      .eq("id", injuryId)
      .eq("sheet_id", sheetId);
    if (error) throw new Error(error.message);
    await audit(db, {
      actor: session.user.id,
      action: "injury.remove",
      entity: "injury",
      entityId: injuryId,
      details: { sheet_id: sheetId },
    });
    revalidatePath(sheetPath(bundle.plateau.id, sheetId));
    return { status: "ok", message: "Blessé retiré." };
  });
}
