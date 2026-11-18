import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { cache } from "react";

import { getSupabaseAdmin } from "../supabase-admin";

import { safeNext, supabasePublicEnv } from "./env";

export type Role = "admin" | "delegate";

export interface Session {
  user: User;
  role: Role | null;
  fullName: string | null;
}

export async function createSupabaseServer() {
  const { url, anon } = supabasePublicEnv();
  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) {
            store.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component : le proxy rafraîchit la session.
        }
      },
    },
  });
}

/**
 * Utilisateur connecté (vérifié auprès de Supabase, pas seulement lu dans le
 * cookie) et son rôle. Le profil est lu avec la clé service_role : la table
 * `profiles` n'a aucune policy.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("role, full_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return {
    user,
    role: (data?.role as Role | undefined) ?? null,
    fullName: data?.full_name ?? null,
  };
});

const hasRole = (session: Session | null, roles: Role[]) =>
  !!session?.role && roles.includes(session.role);

/** Pour une page : renvoie vers /login sans session ou sans le bon rôle. */
export async function requireRole(roles: Role[]): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasRole(session, roles)) redirect("/login?error=acces");
  return session;
}

/** Pour une route API ou une action serveur : session ou réponse 401/403. */
export async function roleOrResponse(
  roles: Role[]
): Promise<Session | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Connexion requise" },
      { status: 401 }
    );
  }
  if (!hasRole(session, roles)) {
    return NextResponse.json(
      { ok: false, message: "Accès refusé" },
      { status: 403 }
    );
  }
  return session;
}

/** Message identique que l'adresse ait un compte ou non. */
const SENT_MESSAGE =
  "Si cette adresse a un accès, un lien de connexion vient de lui être envoyé.";

export type MagicLinkState =
  | { status: "idle" }
  | { status: "sent"; message: string }
  | { status: "error"; message: string };

/**
 * Envoie un lien magique aux comptes existants seulement : les comptes sont
 * créés par l'admin (délégués) ou à la main (admins).
 */
export async function sendMagicLink(
  formData: FormData
): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Adresse email invalide." };
  }
  const origin = (await headers()).get("origin") ?? "";
  const next = safeNext(String(formData.get("next") ?? "/"));
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error && error.status === 429) {
    return {
      status: "error",
      message: "Trop de demandes. Réessaie dans quelques minutes.",
    };
  }
  return { status: "sent", message: SENT_MESSAGE };
}

/**
 * Retour du lien magique. Deux formes :
 *  - `?code=` : lien envoyé depuis /login (flux PKCE, même navigateur) ;
 *  - `?token_hash=&type=` : lien construit par l'admin à partir de
 *    `generateLink`, valable depuis n'importe quel appareil.
 */
export async function handleAuthCallback(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const next = safeNext(params.get("next"));
  const supabase = await createSupabaseServer();

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash) {
    const type = (params.get("type") ?? "email") as EmailOtpType;
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash }))
      .error;
  }

  const target = request.nextUrl.clone();
  target.search = "";
  target.pathname = ok ? next : "/login";
  if (!ok) target.searchParams.set("error", "lien");
  return NextResponse.redirect(target);
}

export async function handleSignOut(request: NextRequest) {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  const target = request.nextUrl.clone();
  target.pathname = "/login";
  target.search = "";
  return NextResponse.redirect(target, { status: 303 });
}
