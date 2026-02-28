/**
 * Calibration draft persistence in sessionStorage.
 * Keyed by analysisId + label.
 */

import type { CalibrationAnswers } from "./types";

const STORAGE_PREFIX = "framemogr_calibration_draft:";

function getKey(analysisId: string, label: string): string {
  return `${STORAGE_PREFIX}${analysisId}:${label}`;
}

export function loadCalibrationDraft(
  analysisId: string,
  label: string
): CalibrationAnswers {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(getKey(analysisId, label));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CalibrationAnswers;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function saveCalibrationDraft(
  analysisId: string,
  label: string,
  answers: CalibrationAnswers
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      getKey(analysisId, label),
      JSON.stringify(answers)
    );
  } catch {
    // ignore
  }
}

export function clearCalibrationDraft(
  analysisId: string,
  label: string
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(getKey(analysisId, label));
  } catch {
    // ignore
  }
}
