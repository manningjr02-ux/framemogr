"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import PersonOverlaySelector from "@/components/PersonOverlaySelector";
import SelectLoadingCinematic from "@/components/SelectLoadingCinematic";
import { parseDetectResponse } from "@/lib/detectResponseSchema";
import type { DetectedPerson } from "@/lib/types/database";

const isDev = process.env.NODE_ENV === "development";

function SelectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("analysisId") ?? "";
  const debug = isDev && searchParams.get("debug") === "1";

  const [detectResult, setDetectResult] = useState<{
    imageUrl: string;
    people: DetectedPerson[];
  } | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [competitorsFoundPhase, setCompetitorsFoundPhase] = useState(false);
  const [competitorsFoundDone, setCompetitorsFoundDone] = useState(false);
  const competitorsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runDetect = useCallback(async () => {
    const res = await fetch("/api/analysis/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    });

    if (res.status === 409) return { status: "detecting" as const };

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 422) {
        throw new Error("We couldn't detect faces. Try another photo.");
      }
      throw new Error(
        data?.error || data?.detail || `detect failed (${res.status})`
      );
    }
    const parsed = parseDetectResponse(data);
    if (!parsed) {
      throw new Error("We couldn't detect faces. Try another photo.");
    }
    return parsed;
  }, [analysisId]);

  useEffect(() => {
    if (!analysisId) return;
    let cancelled = false;

    (async () => {
      setError(null);
      setLoading(true);
      setDetecting(true);
      try {
        const result = await runDetect();
        if (cancelled) return;
        if (result && "imageUrl" in result && "people" in result) {
          setDetectResult({ imageUrl: result.imageUrl, people: result.people });
        } else {
          setDetectResult({ imageUrl: "", people: [] });
        }
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) {
          setLoading(false);
          setDetecting(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [analysisId, runDetect]);

  useEffect(() => {
    if (isDev && debug && detectResult) {
      console.log("[FrameMog debug] detection output", detectResult);
    }
  }, [debug, detectResult]);

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
    setError(null);
    setDetectResult(null);
    setLoading(true);
    setDetecting(true);
    try {
      const result = await runDetect();
      if (result && "imageUrl" in result && "people" in result) {
        setDetectResult({ imageUrl: result.imageUrl, people: result.people });
      } else {
        setDetectResult({ imageUrl: "", people: [] });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setDetecting(false);
    }
  }, [analysisId, runDetect]);

  const overlayPeople = detectResult?.people ?? [];
  const selectedPersonValid =
    !selectedPersonId ||
    overlayPeople.some((p) => p.id === selectedPersonId);
  const canSubmit =
    !!selectedLabel &&
    !!selectedPersonId &&
    selectedPersonValid &&
    !submitting;

  const handleAnalyze = async () => {
    if (!analysisId || !selectedLabel) return;
    if (!selectedPersonId || !selectedPersonValid) {
      setError("Please select yourself from the list.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/analysis/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId,
          selectedLabel,
          selectedPersonId,
        }),
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

  if (error && detectResult == null) {
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

        {detectResult && (
          <>
            <div className="mt-12 max-w-2xl">
              <PersonOverlaySelector
                imageUrl={detectResult.imageUrl}
                people={detectResult.people}
                debug={debug}
                onSelect={(personId, label) => {
                  setSelectedPersonId(personId);
                  setSelectedLabel(label);
                }}
              />
            </div>
            {overlayPeople.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {overlayPeople.map((p) => {
                  const letter = p.label.replace(/^Person\s+/i, "").trim().slice(0, 1).toUpperCase() || "?";
                  const isSelected = selectedLabel === p.label;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPersonId(p.id);
                        setSelectedLabel(p.label);
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? "bg-cyan-500 text-black ring-2 ring-cyan-400"
                          : "bg-zinc-700 text-white hover:bg-zinc-600"
                      }`}
                    >
                      I&apos;m {letter}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {selectedLabel && !selectedPersonValid && (
          <p className="mt-6 rounded-lg bg-red-500/10 px-4 py-3 text-red-400">
            Selected person not found. Please choose again.
          </p>
        )}
        {error && (
          <p className="mt-6 rounded-lg bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canSubmit}
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
