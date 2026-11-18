import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

import {
  audit,
  invitationEmail,
  type PlateauRow,
} from "@flagscore/core/sheets";
import { getSupabaseAdmin } from "@flagscore/core/supabase-admin";

function matchsUrl() {
  const url = process.env.MATCHS_URL;
  if (!url) throw new Error("MATCHS_URL n'est pas configurée");
  return url;
}

const USERS_PAGE = 1000;

/** Compte du délégué : créé s'il manque, retrouvé par son email sinon. */
async function delegateAccount(
  db: SupabaseClient,
  email: string,
  fullName: string
): Promise<{ userId: string; created: boolean }> {
  const created = await db.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (!created.error) return { userId: created.data.user.id, created: true };
  if (created.error.code !== "email_exists") {
    throw new Error(created.error.message);
  }
  // L'API admin ne cherche pas par email : on parcourt les comptes.
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({
      page,
      perPage: USERS_PAGE,
    });
    if (error) throw new Error(error.message);
    const user = data.users.find(
      u => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (user) return { userId: user.id, created: false };
    if (data.users.length < USERS_PAGE) {
      throw new Error(`Compte introuvable pour ${email}`);
    }
  }
}

async function sendInvitation(input: {
  email: string;
  fullName: string;
  plateau: PlateauRow;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY n'est pas configurée");
  const { subject, text, html } = invitationEmail({
    ...input,
    matchsUrl: matchsUrl(),
  });
  const { error } = await new Resend(key).emails.send({
    from: process.env.RESEND_FROM ?? "Flagscore <onboarding@resend.dev>",
    to: input.email,
    subject,
    text,
    html,
  });
  if (error) throw new Error(error.message);
}

/**
 * Invite (ou réinvite) un délégué sur un plateau. Rejouable : le compte, le
 * profil et l'affectation sont créés seulement s'ils manquent ; un compte
 * admin le reste. L'email ne contient pas de lien de connexion (voir
 * `invitationEmail`).
 */
export async function inviteDelegate(input: {
  plateau: PlateauRow;
  email: string;
  fullName: string;
  actorId: string;
}) {
  const db = getSupabaseAdmin();
  const { userId, created } = await delegateAccount(
    db,
    input.email,
    input.fullName
  );
  const profile = await db
    .from("profiles")
    .upsert(
      { user_id: userId, role: "delegate", full_name: input.fullName },
      { onConflict: "user_id", ignoreDuplicates: true }
    );
  if (profile.error) throw new Error(profile.error.message);
  const assignment = await db.from("delegate_assignments").upsert(
    {
      plateau_id: input.plateau.id,
      user_id: userId,
      invited_at: new Date().toISOString(),
    },
    { onConflict: "plateau_id,user_id" }
  );
  if (assignment.error) throw new Error(assignment.error.message);

  await sendInvitation({
    email: input.email,
    fullName: input.fullName,
    plateau: input.plateau,
  });
  await audit(db, {
    actor: input.actorId,
    action: created ? "delegate.invite" : "delegate.reinvite",
    entity: "plateau",
    entityId: input.plateau.id,
    details: { user_id: userId, email: input.email },
  });
}
