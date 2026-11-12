import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service_role : contourne la RLS.
 * À utiliser uniquement côté serveur (routes API, crons), jamais dans un
 * composant client.
 */
let admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis"
    );
  }
  admin = createClient(url, key, { auth: { persistSession: false } });
  return admin;
}
