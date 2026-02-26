"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import AnalyzingCinematic from "@/components/AnalyzingCinematic";

const MIN_SUSPENSE_MS = 2000;
const VERDICT_HOLD_MS = 380;
const POLL_INTERVAL_MS = 1500;
const LOADING_TIMEOUT_MS = 90000;

function AnalyzingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("analysisId");

  const [status, setStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVerdictReady, setShowVerdictReady] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [retryKey, setRetryKey] = useState(0);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const verdictTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pollStatus = useCallback(async () => {
    if (!analysisId) return;
    const res = await fetch(
      `/api/analysis/status?analysisId=${encodeURIComponent(analysisId)}`
    );
    const data = await res.json().catch(() => ({}));
    if (data.status) setStatus(data.status);
    if (data.error_message) setErrorMessage(data.error_message);
  }, [analysisId]);

  useEffect(() => {
    if (!analysisId) return;
    fetch("/api/analysis/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    })
      .then(async (runRes) => {
        if (runRes.ok) {
          const data = await runRes.json().catch(() => ({}));
          if (data.ok || data.already_complete) {
            setStatus("complete");
            return;
          }
        }
        await pollStatus();
      })
      .catch(() => {
        pollStatus();
      });
  }, [analysisId, retryKey, pollStatus]);

  useEffect(() => {
    if (!analysisId) return;
    pollStatus();
    const id = setInterval(pollStatus, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [analysisId, pollStatus]);

  useEffect(() => {
    if (!analysisId || status === "complete" || status === "failed") return;
    setLoadingTimedOut(false);
    timeoutRef.current = setTimeout(() => {
      setLoadingTimedOut(true);
      timeoutRef.current = null;
    }, LOADING_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [analysisId, status, retryKey]);

  useEffect(() => {
    if (status !== "complete" || !analysisId) return;
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_SUSPENSE_MS - elapsed);
    const t = setTimeout(() => {
      setShowVerdictReady(true);
      verdictTimerRef.current = setTimeout(() => {
        router.push(`/results?analysisId=${analysisId}`);
      }, VERDICT_HOLD_MS);
    }, remaining);
    return () => {
      clearTimeout(t);
      if (verdictTimerRef.current) {
        clearTimeout(verdictTimerRef.current);
        verdictTimerRef.current = null;
      }
    };
  }, [status, analysisId, router, startTime]);

  const handleRetry = () => {
    setStatus(null);
    setErrorMessage(null);
    setShowVerdictReady(false);
    setLoadingTimedOut(false);
    setRetryKey((k) => k + 1);
  };

  if (!analysisId) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center">
        <Container className="text-center">
          <p className="text-xl text-red-400">Missing analysis ID</p>
          <Link href="/upload" className="mt-6 text-cyan-400 hover:text-cyan-300">
            ← Back to Upload
          </Link>
        </Container>
      </main>
    );
  }

  if (loadingTimedOut) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center">
        <Container className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            Taking longer than expected
          </h1>
          <p className="mt-6 text-lg text-zinc-400">
            Analysis is still running. You can retry or go back and try again.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-8 rounded-lg bg-cyan-500 px-10 py-4 font-semibold text-black transition hover:bg-cyan-400"
          >
            Retry
          </button>
          <Link
            href="/upload"
            className="mt-4 block text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Upload
          </Link>
        </Container>
      </main>
    );
  }

  if (status === "failed") {
    return (
      <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center">
        <Container className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            Analysis Failed
          </h1>
          <p className="mt-6 text-lg text-zinc-400">
            {errorMessage ?? "Something went wrong."}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-8 rounded-lg bg-cyan-500 px-10 py-4 font-semibold text-black transition hover:bg-cyan-400"
          >
            Retry
          </button>
          <Link
            href="/upload"
            className="mt-4 block text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Upload
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[calc(100vh-65px)] flex-col items-center justify-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(34, 211, 238, 0.05) 0%, transparent 60%)",
        }}
      />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <Container className="relative z-10 flex flex-col items-center">
        <AnalyzingCinematic showVerdictReady={showVerdictReady} />
      </Container>
    </main>
  );
}

export default function AnalyzingPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-[calc(100vh-65px)] flex-col items-center justify-center overflow-hidden">
          <div className="noise-overlay pointer-events-none absolute inset-0" />
          <Container className="relative z-10 flex flex-col items-center">
            <AnalyzingCinematic showVerdictReady={false} />
          </Container>
        </main>
      }
    >
      <AnalyzingPageContent />
    </Suspense>
  );
}
