export function supabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON;
  if (!url || !anon) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON sont requis"
    );
  }
  return { url, anon };
}

/** Chemin de retour interne uniquement : jamais vers un autre domaine. */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/**
 * Redirection après le lien magique : `next` (chemin et requête) si la
 * connexion a réussi, sinon /login. Toujours sur l'origine de la requête.
 */
export function callbackRedirect(
  requestUrl: URL,
  next: string | null,
  ok: boolean
): URL {
  const { origin } = requestUrl;
  if (!ok) return new URL("/login?error=lien", origin);
  const target = new URL(safeNext(next), origin);
  return target.origin === origin
    ? new URL(target.pathname + target.search, origin)
    : new URL("/", origin);
}
