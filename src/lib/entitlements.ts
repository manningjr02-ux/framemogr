import { supabase } from "@/lib/supabase/public";

export type UserEntitlement = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: string | null;
  updated_at: string;
};

/**
 * Fetch the current user's entitlement row from user_entitlements.
 * Returns null if no session or no row exists.
 */
export async function getMyEntitlement(): Promise<UserEntitlement | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from("user_entitlements")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) return null;
  return data as UserEntitlement | null;
}

/**
 * Returns true if the entitlement grants paid access:
 * - status is 'trialing' or 'active'
 * - AND (no current_period_end OR current_period_end > now)
 */
export function hasPaidAccess(ent: UserEntitlement | null): boolean {
  if (!ent) return false;
  if (ent.status !== "trialing" && ent.status !== "active") return false;
  if (!ent.current_period_end) return true;
  return new Date(ent.current_period_end) > new Date();
}

/**
 * Upsert a profiles row for the current user with id and email.
 * Call after signup to create the profile.
 */
export async function ensureProfile(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return;

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
    },
    { onConflict: "id" }
  );
}
