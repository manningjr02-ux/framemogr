"use client";

/**
 * Manual tests:
 * 1) Upload → /select loads normally
 * 2) Selecting label routes to /calibrate with analysisId + label
 * 3) Wizard gates Continue until current question answered
 * 4) Refresh retains progress (sessionStorage)
 * 5) Apply Calibration calls /api/analysis/calibrate then /api/analysis/start
 * 6) Routes to /results and results still load
 * 7) If API fails, show error and allow retry
 * 8) No console errors/hydration warnings
 */

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import RequireAuth from "@/src/components/auth/RequireAuth";
import CalibrationShell from "@/src/components/calibrate/CalibrationShell";
import { useCalibrationWizard } from "@/src/hooks/useCalibrationWizard";
import { submitCalibrationAndStart } from "@/src/lib/calibrate/submit";
import { getMyEntitlement, hasPaidAccess } from "@/src/lib/entitlements";

function CalibratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisIdFromUrl = searchParams.get("analysisId");
  const analysisId = analysisIdFromUrl ?? "";
  const label = searchParams.get("label") ?? "";

  const [submitting, setSubmitting] = useState(false);
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    if (analysisIdFromUrl && !label) {
      setResuming(true);
      router.replace(`/analyzing?analysisId=${encodeURIComponent(analysisIdFromUrl)}`);
    }
  }, [analysisIdFromUrl, label, router]);

  const [error, setError] = useState<string | null>(null);

  const draftKey = analysisId && label ? `${analysisId}:${label}` : "";
  const wizard = useCalibrationWizard(draftKey);

  const handleFinish = useCallback(async () => {
    if (!wizard.isLast || !wizard.questionComplete || !analysisId || !label)
      return;
    setSubmitting(true);
    setError(null);
    try {
      await submitCalibrationAndStart({
        analysisId,
        selectedLabel: label,
        answers: wizard.answers,
      });
      const ent = await getMyEntitlement();
      if (!hasPaidAccess(ent)) {
        router.push(
          `/paywall?returnTo=${encodeURIComponent(`/analyzing?analysisId=${analysisId}`)}`
        );
      } else {
        router.push(`/analyzing?analysisId=${analysisId}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }, [
    wizard.isLast,
    wizard.questionComplete,
    wizard.answers,
    analysisId,
    label,
    router,
  ]);

  const handleNext = useCallback(() => {
    if (wizard.isLast && wizard.questionComplete) {
      handleFinish();
    } else {
      wizard.next();
    }
  }, [wizard.isLast, wizard.questionComplete, wizard.next, handleFinish]);

  const handleSelect = useCallback(
    (questionId: string, choiceId: string) => {
      if (submitting) return;
      wizard.setAnswer(questionId, choiceId);
    },
    [wizard.setAnswer, submitting]
  );

  if (resuming) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-cyan-500"
          aria-hidden
        />
        <p className="text-sm text-zinc-400">Resuming…</p>
      </main>
    );
  }

  if (!analysisId || !label) {
    return (
      <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400">
            Missing analysisId or label. Go back and select yourself first.
          </p>
          <Link
            href={analysisId ? `/select?analysisId=${analysisId}` : "/upload"}
            className="mt-6 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
          >
            ← Back to Select
          </Link>
        </div>
      </main>
    );
  }

  return (
    <CalibrationShell
      title="Calibrating your frame profile"
      subtitle="We adjust for context and posture intent to improve accuracy."
      currentQuestion={wizard.currentQuestion}
      questionIndex={wizard.questionIndex}
      totalQuestions={wizard.totalQuestions}
      answers={wizard.answers}
      progress={wizard.progress}
      questionComplete={wizard.questionComplete}
      canBack={wizard.canBack}
      canNext={wizard.canNext}
      isLast={wizard.isLast}
      submitting={submitting}
      error={error}
      onSelect={handleSelect}
      onBack={wizard.back}
      onNext={handleNext}
    />
  );
}

export default function CalibratePage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <main className="relative flex min-h-[calc(100vh-65px)] flex-col items-center justify-center overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(34, 211, 238, 0.05) 0%, transparent 60%)",
              }}
            />
            <div className="noise-overlay pointer-events-none absolute inset-0" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
              <div className="mt-6 h-4 w-64 animate-pulse rounded bg-zinc-800" />
            </div>
          </main>
        }
      >
        <CalibratePageContent />
      </Suspense>
    </RequireAuth>
  );
}
