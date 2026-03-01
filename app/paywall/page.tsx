"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import RequireAuth from "@/src/components/auth/RequireAuth";
import PaywallCard from "@/components/paywall/PaywallCard";
import { getMyEntitlement, hasPaidAccess } from "@/src/lib/entitlements";
import { supabase } from "@/lib/supabase/public";

const POLL_INTERVAL_MS = 2000;
const POLL_DURATION_MS = 30000;

function PaywallPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/results";

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [startTrialLoading, setStartTrialLoading] = useState(false);
  const [polling, setPolling] = useState(true);
  const pollUntilRef = useRef<number>(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    })();
  }, []);

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
    const base =
      process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL ??
      "https://buy.stripe.com/placeholder";
    const sep = base.includes("?") ? "&" : "?";
    const emailParam = userEmail
      ? `${sep}prefilled_email=${encodeURIComponent(userEmail)}`
      : "";
    setStartTrialLoading(true);
    window.location.href = `${base}${emailParam}`;
  }

  return (
    <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center py-16">
      <Container className="flex flex-col items-center">
        <PaywallCard
          onStartTrial={handleStartTrial}
          startTrialLoading={startTrialLoading}
        />
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
