import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Creates a Supabase client with the service role key.
 * Server-only — do not import into client components.
 */
export function supabaseService(): SupabaseClient {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

/** Pre-created service-role client for convenience (uses supabaseService internally). */
export const supabaseAdmin = supabaseService();
