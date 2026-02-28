"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Container from "@/components/Container";
import CalibrationStep from "@/components/CalibrationStep";
import { useCalibrationState } from "@/hooks/useCalibrationState";
import { CALIBRATION_STEPS } from "@/lib/calibrationSchema";

type Props = {
  analysisId: string;
  selectedLabel: string;
};

export default function CalibrationWizard({ analysisId, selectedLabel }: Props) {
  const router = useRouter();
  const { answers, setAnswer } = useCalibrationState(analysisId);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const step = CALIBRATION_STEPS[stepIndex];
  const isLast = stepIndex === CALIBRATION_STEPS.length - 1;
  const canProceed = step ? !!answers[step.key] : false;
  const progress = ((stepIndex + 1) / CALIBRATION_STEPS.length) * 100;

  const handleNext = () => {
    if (isLast) {
      handleApply();
    } else {
      setStepIndex((i) => Math.min(i + 1, CALIBRATION_STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleApply = async () => {
    setSubmitting(true);
    try {
      const calibrateRes = await fetch("/api/analysis/calibrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId,
          selectedLabel,
          answers,
        }),
      });
      if (!calibrateRes.ok) {
        const data = await calibrateRes.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to save calibration");
      }

      const startRes = await fetch("/api/analysis/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId }),
      });
      if (!startRes.ok) {
        throw new Error("Failed to start analysis");
      }

      router.push(`/analyzing?analysisId=${analysisId}`);
    } catch (e) {
      setSubmitting(false);
      alert(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-65px)] flex-col items-center justify-center overflow-hidden py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(34, 211, 238, 0.06) 0%, transparent 55%)",
        }}
      />
      <div className="noise-overlay pointer-events-none absolute inset-0" />

      <Container className="relative z-10 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-12"
        >
          <div className="space-y-2">
            <p className="text-sm font-medium text-cyan-400/90">
              Calibration
            </p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Fine-tune your analysis
            </h1>
            <p className="text-zinc-400">
              A few quick choices to personalize your results.
            </p>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              className="h-full bg-cyan-500/80"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <CalibrationStep
              key={step.id}
              step={step}
              answers={answers}
              onSelect={setAnswer}
            />
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={stepIndex === 0}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition hover:text-white disabled:opacity-0"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed || submitting}
              className="rounded-lg bg-cyan-500 px-8 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Applying…"
                : isLast
                  ? "Apply Calibration"
                  : "Next"}
            </button>
          </div>
        </motion.div>
      </Container>
    </main>
  );
}
