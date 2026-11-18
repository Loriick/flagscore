"use server";

import type { ActionState } from "@flagscore/ui/ActionForm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@flagscore/core/auth/server";
import {
  audit,
  idInput,
  inviteInput,
  loadSheet,
  PLATEAU_COLUMNS,
  type PlateauRow,
  plateauInput,
  reopenSheet,
  SheetError,
} from "@flagscore/core/sheets";
import { poolEvents } from "@flagscore/core/social/results";
import { getSupabaseAdmin } from "@flagscore/core/supabase-admin";

import { inviteDelegate } from "@/lib/invite";

const failure = (message: string): ActionState => ({
  status: "error",
  message,
});

async function loadPlateau(id: string): Promise<PlateauRow> {
  const { data, error } = await getSupabaseAdmin()
    .from("plateaux")
    .select(PLATEAU_COLUMNS)
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data as PlateauRow;
}

export async function savePlateau(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["admin"]);
  const parsed = plateauInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return failure("Vérifie la poule, la journée, la date et le lieu.");
  const input = parsed.data;
  if (!poolEvents(input.poolId).some(e => e.key === input.eventKey)) {
    return failure("Cette journée n'existe pas pour cette poule.");
  }
  const values = {
    pool_id: input.poolId,
    event_key: input.eventKey,
    date: input.date,
    venue: input.venue,
    host_club: input.hostClub,
  };
  const db = getSupabaseAdmin();
  const existingId = idInput.safeParse(formData.get("id")).data;
  const { data, error } = existingId
    ? await db
        .from("plateaux")
        .update(values)
        .eq("id", existingId)
        .select("id")
        .single()
    : await db.from("plateaux").insert(values).select("id").single();
  if (error) return failure(error.message);
  await audit(db, {
    actor: session.user.id,
    action: existingId ? "plateau.update" : "plateau.create",
    entity: "plateau",
    entityId: data.id,
    details: values,
  });
  revalidatePath("/plateaux");
  redirect(`/plateaux/${data.id}`);
}

export async function deletePlateau(formData: FormData) {
  const session = await requireRole(["admin"]);
  const id = idInput.parse(formData.get("id"));
  const db = getSupabaseAdmin();
  const { count, error } = await db
    .from("match_sheets")
    .select("id", { count: "exact", head: true })
    .eq("plateau_id", id);
  if (error) throw new Error(error.message);
  // Une feuille saisie est une trace du match : on ne la supprime pas en cascade.
  if (count)
    throw new Error(
      "Ce plateau a des feuilles de match : suppression impossible."
    );
  const del = await db.from("plateaux").delete().eq("id", id);
  if (del.error) throw new Error(del.error.message);
  await audit(db, {
    actor: session.user.id,
    action: "plateau.delete",
    entity: "plateau",
    entityId: id,
  });
  revalidatePath("/plateaux");
  redirect("/plateaux");
}

export async function invite(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["admin"]);
  const parsed = inviteInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return failure("Indique un nom et une adresse email valide.");
  try {
    await inviteDelegate({
      plateau: await loadPlateau(parsed.data.plateauId),
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      actorId: session.user.id,
    });
  } catch (e) {
    return failure(`Invitation non envoyée : ${(e as Error).message}`);
  }
  revalidatePath(`/plateaux/${parsed.data.plateauId}`);
  return {
    status: "ok",
    message: `Invitation envoyée à ${parsed.data.email}.`,
  };
}

export async function resendInvite(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["admin"]);
  const plateauId = idInput.parse(formData.get("plateauId"));
  const userId = idInput.parse(formData.get("userId"));
  const db = getSupabaseAdmin();
  const { data, error } = await db.auth.admin.getUserById(userId);
  if (error || !data.user.email) return failure("Compte introuvable.");
  const { data: profile } = await db
    .from("profiles")
    .select("full_name")
    .eq("user_id", userId)
    .maybeSingle();
  try {
    await inviteDelegate({
      plateau: await loadPlateau(plateauId),
      email: data.user.email,
      fullName: profile?.full_name ?? data.user.email,
      actorId: session.user.id,
    });
  } catch (e) {
    return failure(`Invitation non envoyée : ${(e as Error).message}`);
  }
  revalidatePath(`/plateaux/${plateauId}`);
  return { status: "ok", message: "Invitation renvoyée." };
}

export async function removeDelegate(formData: FormData) {
  const session = await requireRole(["admin"]);
  const plateauId = idInput.parse(formData.get("plateauId"));
  const userId = idInput.parse(formData.get("userId"));
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("delegate_assignments")
    .delete()
    .eq("plateau_id", plateauId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  await audit(db, {
    actor: session.user.id,
    action: "delegate.remove",
    entity: "plateau",
    entityId: plateauId,
    details: { user_id: userId },
  });
  revalidatePath(`/plateaux/${plateauId}`);
}

export async function reopen(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["admin"]);
  const db = getSupabaseAdmin();
  const bundle = await loadSheet(db, idInput.parse(formData.get("sheetId")));
  if (!bundle) return failure("Feuille introuvable.");
  try {
    await reopenSheet(db, bundle, session.user.id);
  } catch (e) {
    if (e instanceof SheetError) return failure(e.message);
    throw e;
  }
  revalidatePath(`/plateaux/${bundle.plateau.id}`);
  return {
    status: "ok",
    message:
      "Feuille rouverte : le score est retiré du site jusqu'à la nouvelle signature.",
  };
}
