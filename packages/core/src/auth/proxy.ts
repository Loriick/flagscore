import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabasePublicEnv } from "./env";

/**
 * Rafraîchit la session Supabase à chaque requête (cookies) et renvoie vers
 * /login les pages privées sans session. Ce n'est qu'un premier filtre : chaque
 * page et chaque route revérifie la session et le rôle côté serveur.
 */
export async function refreshSession(
  request: NextRequest,
  isPublic: (pathname: string) => boolean
): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next({ request });

  const { url, anon } = supabasePublicEnv();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return response;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, message: "Connexion requise" },
      { status: 401 }
    );
  }
  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(login);
}
