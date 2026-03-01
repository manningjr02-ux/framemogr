"use client";

/**
 * Login page using Supabase email+password auth.
 * Uses signInWithPassword — no email verification, no magic link.
 *
 * Supabase dashboard must have:
 * Auth -> Providers -> Email -> "Confirm email" = OFF
 */

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import { supabase } from "@/lib/supabase/public";

const ALLOWED_NEXT_PREFIXES = ["/calibrate", "/analyzing", "/results", "/select", "/paywall"];

function validateNext(raw: string | null): string | null {
  if (!raw || typeof raw !== "string" || raw.length === 0) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("http://") || lower.includes("https://")) return null;
  if (!ALLOWED_NEXT_PREFIXES.some((p) => raw.startsWith(p))) return null;
  return raw;
}

function LoginPageContent() {
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
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const signupHref =
    rawNext && safeNext ? `/signup?next=${encodeURIComponent(rawNext)}` : "/signup";

  return (
    <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center py-16">
      <Container className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold text-white sm:text-4xl">
          Log in
        </h1>
        <p className="mt-4 text-center text-zinc-400">
          Sign in with your email and password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-zinc-300"
            >
              Email
            </label>
            <input
              id="login-email"
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
              htmlFor="login-password"
              className="block text-sm font-medium text-zinc-300"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="••••••••"
            />
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
            {loading ? "Signing in…" : "Sign in"}
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
          Don&apos;t have an account?{" "}
          <Link href={signupHref} className="font-medium text-cyan-400 hover:text-cyan-300">
            Sign up
          </Link>
        </p>
      </Container>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center py-16">
          <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
          <div className="mt-6 h-4 w-64 animate-pulse rounded bg-zinc-800" />
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
