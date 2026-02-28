/**
 * Calibration submission: POST calibrate, then start.
 */
import { CALIBRATION_VERSION } from "./steps";
import { CALIBRATION_STEPS } from "./steps";
import type { CalibrationAnswers } from "./types";

export async function submitCalibrationAndStart(params: {
  analysisId: string;
  selectedLabel: string;
  answers: CalibrationAnswers;
}): Promise<void> {
  const { analysisId, selectedLabel, answers } = params;

  const calibrateRes = await fetch("/api/analysis/calibrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analysisId,
      selectedLabel,
      answers,
      version: CALIBRATION_VERSION,
    }),
  });

  if (!calibrateRes.ok) {
    const data = await calibrateRes.json().catch(() => ({}));
    throw new Error(data?.error ?? "Failed to save calibration");
  }

  const startRes = await fetch("/api/analysis/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analysisId, selectedLabel }),
  });

  if (!startRes.ok) {
    const data = await startRes.json().catch(() => ({}));
    throw new Error(data?.error ?? "Failed to start analysis");
  }
}

/**
 * Map question-keyed answers to API step shape (step1, step2, step3, step4).
 */
export function mapAnswersToSteps(answers: CalibrationAnswers): {
  step1: Record<string, string> | null;
  step2: Record<string, string> | null;
  step3: Record<string, string> | null;
  step4: Record<string, string> | null;
} {
  const result: {
    step1: Record<string, string> | null;
    step2: Record<string, string> | null;
    step3: Record<string, string> | null;
    step4: Record<string, string> | null;
  } = {
    step1: null,
    step2: null,
    step3: null,
    step4: null,
  };
  for (let i = 0; i < CALIBRATION_STEPS.length; i++) {
    const step = CALIBRATION_STEPS[i];
    if (!step) continue;
    const stepKey = `step${i + 1}` as "step1" | "step2" | "step3" | "step4";
    const stepAnswers: Record<string, string> = {};
    for (const q of step.questions) {
      const v = answers[q.id];
      if (v != null && v !== "") stepAnswers[q.id] = v;
    }
    result[stepKey] = Object.keys(stepAnswers).length > 0 ? stepAnswers : null;
  }
  return result;
}
