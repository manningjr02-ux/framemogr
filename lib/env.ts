const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const required = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

function validateEnv(): Record<keyof typeof required, string> {
  const missing = Object.entries(required)
    .filter(([, v]) => v == null || v === "")
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n\n  - ${missing.join("\n  - ")}\n\n` +
        `Add them to .env.local and restart the dev server.`
    );
  }

  return required as Record<keyof typeof required, string>;
}

let _validated: Record<keyof typeof required, string> | null = null;
function getEnv(): Record<keyof typeof required, string> {
  if (!_validated) _validated = validateEnv();
  return _validated;
}

/** Lazy: validation runs on first property access so build can complete without env vars. */
export const env = new Proxy({} as Record<keyof typeof required, string>, {
  get(_, key) {
    return getEnv()[key as keyof typeof required];
  },
});
