import "server-only";

import { Resend } from "resend";

import {
  audit,
  describePlateau,
  formatDay,
  MATCHS_APP_NAME,
  type PlateauRow,
  teamLabel,
} from "@flagscore/core/sheets";
import { getSupabaseAdmin } from "@flagscore/core/supabase-admin";

function matchsUrl() {
  const url = process.env.MATCHS_URL;
  if (!url) throw new Error("MATCHS_URL n'est pas configurée");
  return url.replace(/\/$/, "");
}

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!
  );

/**
 * Lien de connexion valable depuis n'importe quel appareil : on n'utilise
 * pas l'`action_link` de Supabase (il renvoie la session dans le fragment de
 * l'URL, illisible côté serveur) mais son `hashed_token`, vérifié par
 * /auth/callback de l'app matchs.
 */
async function loginLink(email: string, plateauId: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error) throw new Error(error.message);
  const params = new URLSearchParams({
    token_hash: data.properties.hashed_token,
    type: "magiclink",
    next: `/plateau/${plateauId}`,
  });
  return {
    userId: data.user.id,
    url: `${matchsUrl()}/auth/callback?${params}`,
  };
}

async function sendInvitation(input: {
  email: string;
  fullName: string;
  plateau: PlateauRow;
  link: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY n'est pas configurée");
  const { pool, stage, competition, teams } = describePlateau(input.plateau);
  const day = formatDay(input.plateau.date);
  const loginPage = `${matchsUrl()}/login`;
  const before = [
    `Bonjour ${input.fullName},`,
    `Tu es délégué de match pour le plateau du ${day} (${input.plateau.venue}).`,
    `${competition} · ${pool} · ${stage}`,
    `Équipes : ${teams.map(t => teamLabel(t.ref)).join(", ")}`,
    "Le jour J, tu saisis les scores et les blessés sur ton téléphone, puis les deux coachs et les deux capitaines signent chaque match.",
  ];
  const after = [
    `Ce lien expire vite. S'il ne marche plus, demande un nouveau lien sur ${loginPage} avec cette adresse email.`,
    "L'équipe Flagscore",
  ];
  const linkLabel = `Se connecter à Flagscore ${MATCHS_APP_NAME}`;
  const text = [...before, `${linkLabel} : ${input.link}`, ...after].join(
    "\n\n"
  );
  const html = [
    ...before.map(p => `<p>${escape(p)}</p>`),
    `<p><a href="${escape(input.link)}">${escape(linkLabel)}</a></p>`,
    ...after.map(p => `<p>${escape(p)}</p>`),
  ].join("\n");

  const { error } = await new Resend(key).emails.send({
    from: process.env.RESEND_FROM ?? "Flagscore <onboarding@resend.dev>",
    to: input.email,
    subject: `Délégué de match · ${day} · ${input.plateau.venue}`,
    text,
    html,
  });
  if (error) throw new Error(error.message);
}

/**
 * Invite (ou réinvite) un délégué sur un plateau. Rejouable : le compte, le
 * profil et l'affectation sont créés seulement s'ils manquent ; un compte
 * admin le reste.
 */
export async function inviteDelegate(input: {
  plateau: PlateauRow;
  email: string;
  fullName: string;
  actorId: string;
}) {
  const db = getSupabaseAdmin();
  const created = await db.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });
  if (created.error && created.error.code !== "email_exists") {
    throw new Error(created.error.message);
  }

  const { userId, url } = await loginLink(input.email, input.plateau.id);
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
    link: url,
  });
  await audit(db, {
    actor: input.actorId,
    action: created.error ? "delegate.reinvite" : "delegate.invite",
    entity: "plateau",
    entityId: input.plateau.id,
    details: { user_id: userId, email: input.email },
  });
}
