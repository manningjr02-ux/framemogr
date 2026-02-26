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

let _admin: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) _admin = supabaseService();
  return _admin;
}

/** Lazy: created on first use so build can complete without env vars. */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const target = getSupabaseAdmin() as unknown as Record<string, unknown>;
    const value = target[prop as string];
    // Bind methods so supabaseAdmin.from("table") has correct `this` (fixes serverless/Vercel).
    if (typeof value === "function") {
      return value.bind(target);
    }
    return value;
  },
});

/** Returns a temporary URL for an object in group-uploads (1h expiry). */
export async function getGroupUploadImageUrl(path: string): Promise<string> {
  const p = (path || "").replace(/^\//, "");
  const { data } = await supabaseAdmin.storage
    .from("group-uploads")
    .createSignedUrl(p, 60 * 60);
  const payload = data as { signedUrl?: string } | null;
  return payload?.signedUrl ?? "";
}
