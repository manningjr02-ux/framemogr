"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import RequireAuth from "@/src/components/auth/RequireAuth";
import { getMyEntitlement, hasPaidAccess } from "@/src/lib/entitlements";
import { supabase } from "@/lib/supabase/public";

const POLL_INTERVAL_MS = 2000;
const POLL_DURATION_MS = 30000;

const BENEFITS = [
  "Full Mog Score breakdown with frame leak analysis",
  "Personalized improvement moves and ranking insights",
  "Downloadable Mog Card to share or compare",
  "Unlimited re-runs with new photos",
];

function isValidPaymentLinkUrl(value: string | undefined): boolean {
  if (!value || typeof value !== "string" || value.trim() === "") return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.includes("stripe");
  } catch {
    return false;
  }
}

function PaywallPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/results";

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [startTrialLoading, setStartTrialLoading] = useState(false);
  const [polling, setPolling] = useState(true);
  const [entitlement, setEntitlement] = useState<Awaited<ReturnType<typeof getMyEntitlement>>>(null);
  const pollUntilRef = useRef<number>(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const paymentLinkUrl = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL;
  const paymentLinkMisconfigured = !isValidPaymentLinkUrl(paymentLinkUrl);
  const alreadyUnlocked = !!entitlement && hasPaidAccess(entitlement);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    })();
  }, []);

  useEffect(() => {
    if (alreadyUnlocked) {
      router.push(returnTo);
      router.refresh();
    }
  }, [alreadyUnlocked, returnTo, router]);

  useEffect(() => {
    pollUntilRef.current = Date.now() + POLL_DURATION_MS;

    const poll = async () => {
      if (Date.now() > pollUntilRef.current) {
        setPolling(false);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        return;
      }
      const ent = await getMyEntitlement();
      setEntitlement(ent);
      if (hasPaidAccess(ent)) {
        setPolling(false);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        router.push(returnTo);
        router.refresh();
      }
    };

    poll();
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [returnTo, router]);

  function handleStartTrial() {
    if (paymentLinkMisconfigured) return;
    const base = paymentLinkUrl!.trim();
    try {
      const url = new URL(base);
      if (userEmail) {
        url.searchParams.set("prefilled_email", userEmail);
      }
      setStartTrialLoading(true);
      window.location.href = url.toString();
    } catch {
      setStartTrialLoading(false);
    }
  }

  const buttonDisabled =
    startTrialLoading || paymentLinkMisconfigured || alreadyUnlocked;
  const buttonText = alreadyUnlocked
    ? "You're already unlocked"
    : startTrialLoading
      ? "Redirecting…"
      : "Start Free Trial";

  return (
    <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center py-16">
      <Container className="flex flex-col items-center">
        <div className="w-full max-w-md rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-8 shadow-xl backdrop-blur-sm sm:p-10">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            Unlock Your Mog Card
          </h2>
          <p className="mt-4 text-center text-zinc-400">
            3-day free trial, then $6.99/week. Cancel anytime.
          </p>

          <ul className="mt-8 space-y-3">
            {BENEFITS.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          {paymentLinkMisconfigured && (
            <p className="mt-6 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
              Payment link is misconfigured. Please try again later.
            </p>
          )}

          {alreadyUnlocked && (
            <p className="mt-4 text-center text-sm text-zinc-500">
              Redirecting you to results…
            </p>
          )}

          <button
            type="button"
            onClick={handleStartTrial}
            disabled={buttonDisabled}
            className="mt-8 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-cyan-500"
          >
            {buttonText}
          </button>

          <Link
            href="/"
            className="mt-4 block w-full text-center text-sm text-zinc-400 hover:text-zinc-300"
          >
            Not now
          </Link>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Secure checkout via Stripe
          </p>
        </div>

        {polling && (
          <p className="mt-8 text-sm text-zinc-500">
            Checking subscription…
          </p>
        )}
      </Container>
    </main>
  );
}

export default function PaywallPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center gap-4 py-16">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-cyan-500"
              aria-hidden
            />
            <p className="text-sm text-zinc-400">Loading…</p>
          </main>
        }
      >
        <PaywallPageContent />
      </Suspense>
    </RequireAuth>
  );
}
