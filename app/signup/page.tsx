"use client";

/**
 * Sign up page using Supabase email+password auth.
 * Uses signUp — NO email verification, NO magic link, NO OTP.
 * Session is created immediately on signup.
 *
 * Supabase dashboard MUST have:
 * Auth -> Providers -> Email -> "Confirm email" = OFF
 * (Otherwise users will be sent a confirmation email and session won't be created.)
 */

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import { supabase } from "@/lib/supabase/public";
import { ensureProfile } from "@/src/lib/entitlements";

const ALLOWED_NEXT_PREFIXES = ["/calibrate", "/analyzing", "/results", "/select", "/paywall"];

function validateNext(raw: string | null): string | null {
  if (!raw || typeof raw !== "string" || raw.length === 0) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("http://") || lower.includes("https://")) return null;
  if (!ALLOWED_NEXT_PREFIXES.some((p) => raw.startsWith(p))) return null;
  return raw;
}

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const safeNext = validateNext(rawNext);
  const redirectTo = safeNext ?? "/calibrate";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // No email redirect — we don't use magic link / OTP.
          // With "Confirm email" OFF in Supabase, session is created immediately.
          emailRedirectTo: undefined,
        },
      });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      await ensureProfile();
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center py-16">
      <Container className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold text-white sm:text-4xl">
          Sign up
        </h1>
        <p className="mt-4 text-center text-zinc-400">
          Create an account with email and password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="signup-email"
              className="block text-sm font-medium text-zinc-300"
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1.5 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-sm font-medium text-zinc-300"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              className="mt-1.5 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-zinc-500">At least 6 characters</p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3">
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {safeNext && (
          <p className="mt-4 text-center">
            <Link
              href={safeNext}
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
            >
              Continue where you left off →
            </Link>
          </p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href={rawNext && safeNext ? `/login?next=${encodeURIComponent(rawNext)}` : "/login"}
            className="font-medium text-cyan-400 hover:text-cyan-300"
          >
            Log in
          </Link>
        </p>
      </Container>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center py-16">
          <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
          <div className="mt-6 h-4 w-64 animate-pulse rounded bg-zinc-800" />
        </main>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
