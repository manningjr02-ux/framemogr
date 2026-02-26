"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import SelectLoadingCinematic from "@/components/SelectLoadingCinematic";

type PersonThumb = { label: string; signedUrl: string | null };

function SelectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("analysisId") ?? "";

  const [people, setPeople] = useState<PersonThumb[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [competitorsFoundPhase, setCompetitorsFoundPhase] = useState(false);
  const [competitorsFoundDone, setCompetitorsFoundDone] = useState(false);
  const competitorsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didDetectRef = useRef<string | null>(null);

  const fetchPeople = useCallback(async () => {
    const res = await fetch(
      `/api/analysis/people?analysisId=${encodeURIComponent(analysisId)}`
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(data?.error || `people failed (${res.status})`);
    const list = Array.isArray(data.people) ? data.people : [];
    return list.map((p: { label: string; signedUrl?: string | null }) => ({
      label: p.label,
      signedUrl: p.signedUrl ?? null,
    })) as PersonThumb[];
  }, [analysisId]);

  const runDetect = useCallback(async () => {
    const res = await fetch("/api/analysis/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    });

    // 409 = detect already running; treat as non-fatal
    if (res.status === 409) return { status: "detecting" as const };

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.error || data?.detail || `detect failed (${res.status})`
      );
    }
    return data;
  }, [analysisId]);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const pollPeopleUntilThumbs = useCallback(async () => {
    const timeoutMs = 20000;
    const intervalMs = 600;
    const start = Date.now();
    let lastStableCount = 0;

    while (Date.now() - start < timeoutMs) {
      const list = await fetchPeople();
      const allHaveThumbs =
        list.length > 0 && list.every((p) => p.signedUrl);
      if (allHaveThumbs) {
        if (list.length === lastStableCount) return list;
        lastStableCount = list.length;
      }
      await sleep(intervalMs);
    }
    return await fetchPeople();
  }, [fetchPeople]);

  useEffect(() => {
    if (!analysisId) return;
    let cancelled = false;

    (async () => {
      setError(null);
      setLoading(true);

      try {
        const list = await fetchPeople();
        const hasThumbs = list.length > 0 && list.some((p: PersonThumb) => p.signedUrl);

        // Show grid as soon as we have people (thumbnails may load or show "No image").
        if (list.length > 0 && !cancelled) setPeople(list);

        if (!hasThumbs && list.length > 0) {
          if (didDetectRef.current !== analysisId) {
            didDetectRef.current = analysisId;
            setDetecting(true);
            await runDetect(); // may be 409, do not throw
            setDetecting(false);
          }
          const ready = await pollPeopleUntilThumbs();
          if (!cancelled) setPeople(ready);
          return;
        }

        if (hasThumbs) {
          const listAfter = await fetchPeople();
          if (!cancelled) setPeople(listAfter);
        }
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [analysisId, fetchPeople, runDetect, pollPeopleUntilThumbs]);

  // When loading completes, show "COMPETITORS FOUND" for 250-350ms then reveal
  useEffect(() => {
    if (loading || detecting) {
      setCompetitorsFoundPhase(false);
      setCompetitorsFoundDone(false);
      if (competitorsTimerRef.current) {
        clearTimeout(competitorsTimerRef.current);
        competitorsTimerRef.current = null;
      }
      return;
    }
    setCompetitorsFoundPhase(true);
    competitorsTimerRef.current = setTimeout(() => {
      setCompetitorsFoundDone(true);
      competitorsTimerRef.current = null;
    }, 300);
    return () => {
      if (competitorsTimerRef.current) {
        clearTimeout(competitorsTimerRef.current);
      }
    };
  }, [loading, detecting]);

  const handleRetryDetect = useCallback(async () => {
    if (!analysisId) return;
    didDetectRef.current = null;
    setError(null);
    setLoading(true);
    setDetecting(true);
    try {
      await runDetect();
      const ready = await pollPeopleUntilThumbs();
      setPeople(ready);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setDetecting(false);
    }
  }, [analysisId, runDetect, pollPeopleUntilThumbs]);

  const handleAnalyze = async () => {
    if (!analysisId || !selectedLabel) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/analysis/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, selectedLabel }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to save selection");
        return;
      }
      router.push(`/analyzing?analysisId=${analysisId}`);
    } catch {
      setError("Failed to save selection");
    } finally {
      setSubmitting(false);
    }
  };

  if (!analysisId) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center">
        <Container className="text-center">
          <p className="text-xl text-red-400">
            Missing analysisId in URL. Go back and upload again.
          </p>
          <Link
            href="/upload"
            className="mt-6 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
          >
            ← Back to Upload
          </Link>
        </Container>
      </main>
    );
  }

  if (loading || detecting || (competitorsFoundPhase && !competitorsFoundDone)) {
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
          <SelectLoadingCinematic
            showFinalText={competitorsFoundPhase && !competitorsFoundDone}
          />
        </Container>
      </main>
    );
  }

  if (error && !people.length) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center">
        <Container className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">Select</h1>
          <div className="mt-8 rounded-lg border border-red-500/50 bg-red-500/10 px-6 py-4">
            <p className="text-lg font-medium text-red-400">{error}</p>
            <button
              type="button"
              onClick={handleRetryDetect}
              className="mt-4 rounded-lg bg-cyan-500 px-6 py-2 font-semibold text-black hover:bg-cyan-400"
            >
              Retry Detect
            </button>
          </div>
          <Link
            href="/upload"
            className="mt-6 block text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Upload
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-65px)] flex-col items-center py-16">
      <Container className="text-center">
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">Select</h1>
        <p className="mt-6 text-lg text-zinc-400 sm:text-xl">
          Select yourself to calculate YOUR frame gap.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => {
            const isSelected = selectedLabel === p.label;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setSelectedLabel(p.label)}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-left transition ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500"
                    : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-600"
                }`}
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-zinc-800">
                  {p.signedUrl ? (
                    <img
                      src={p.signedUrl}
                      alt={p.label}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-500">
                      No image
                    </div>
                  )}
                </div>
                <span className="text-lg font-medium text-white">{p.label}</span>
              </button>
            );
          })}
        </div>
        {error && (
          <p className="mt-6 rounded-lg bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!selectedLabel || submitting}
          className="mt-12 rounded-lg bg-cyan-500 px-10 py-4 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Analyze My Frame"}
        </button>
      </Container>
    </main>
  );
}

export default function SelectPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-[calc(100vh-65px)] flex-col items-center justify-center overflow-hidden">
          <div className="noise-overlay pointer-events-none absolute inset-0" />
          <Container className="relative z-10 flex flex-col items-center">
            <SelectLoadingCinematic showFinalText={false} />
          </Container>
        </main>
      }
    >
      <SelectPageContent />
    </Suspense>
  );
}
