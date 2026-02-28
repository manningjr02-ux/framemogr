"use client";

import { useState, useEffect, useCallback } from "react";
import type { CalibrationAnswers } from "@/lib/calibrationSchema";

const STORAGE_KEY = "framemog_calibration";

function loadFromStorage(analysisId: string): CalibrationAnswers {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}_${analysisId}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CalibrationAnswers;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function saveToStorage(analysisId: string, answers: CalibrationAnswers): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      `${STORAGE_KEY}_${analysisId}`,
      JSON.stringify(answers)
    );
  } catch {
    // ignore
  }
}

export function useCalibrationState(analysisId: string) {
  const [answers, setAnswersState] = useState<CalibrationAnswers>(() =>
    loadFromStorage(analysisId)
  );

  useEffect(() => {
    setAnswersState(loadFromStorage(analysisId));
  }, [analysisId]);

  const setAnswer = useCallback(
    (key: keyof CalibrationAnswers, value: string | undefined) => {
      setAnswersState((prev) => {
        const next = { ...prev, [key]: value };
        saveToStorage(analysisId, next);
        return next;
      });
    },
    [analysisId]
  );

  const clear = useCallback(() => {
    setAnswersState({});
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(`${STORAGE_KEY}_${analysisId}`);
      } catch {
        // ignore
      }
    }
  }, [analysisId]);

  return { answers, setAnswer, clear };
}
