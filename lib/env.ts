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

export const env = validateEnv();
