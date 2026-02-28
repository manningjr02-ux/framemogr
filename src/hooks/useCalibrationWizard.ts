"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ALL_QUESTIONS,
  CALIBRATION_VERSION,
} from "@/src/lib/calibrate/steps";
import type { CalibrationAnswers } from "@/src/lib/calibrate/types";

const STORAGE_PREFIX = "framemogr_calibration_draft:";

type VersionedDraft = {
  version: string;
  answers: CalibrationAnswers;
  questionIndex?: number;
};

type LoadedDraft = {
  answers: CalibrationAnswers;
  questionIndex: number;
};

function deriveQuestionIndex(answers: CalibrationAnswers): number {
  const total = ALL_QUESTIONS.length;
  const idx = ALL_QUESTIONS.findIndex((q) => !answers[q.id]);
  return idx >= 0 ? idx : total - 1;
}

function loadDraft(key: string): LoadedDraft {
  if (typeof window === "undefined") return { answers: {}, questionIndex: 0 };
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return { answers: {}, questionIndex: 0 };
    const parsed = JSON.parse(raw) as VersionedDraft;
    if (parsed?.version !== CALIBRATION_VERSION)
      return { answers: {}, questionIndex: 0 };
    const answers = parsed?.answers ?? {};
    const questionIndex =
      typeof parsed?.questionIndex === "number" && parsed.questionIndex >= 0
        ? Math.min(parsed.questionIndex, ALL_QUESTIONS.length - 1)
        : deriveQuestionIndex(answers);
    return { answers, questionIndex };
  } catch {
    return { answers: {}, questionIndex: 0 };
  }
}

function saveDraft(
  key: string,
  answers: CalibrationAnswers,
  questionIndex: number
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: VersionedDraft = {
      version: CALIBRATION_VERSION,
      answers,
      questionIndex,
    };
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify(payload)
    );
  } catch {
    // ignore
  }
}

function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // ignore
  }
}

const TOTAL_QUESTIONS = ALL_QUESTIONS.length;

export function useCalibrationWizard(key: string) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswersState] = useState<CalibrationAnswers>({});

  useEffect(() => {
    const { answers: a, questionIndex: i } = loadDraft(key);
    setAnswersState(a);
    setQuestionIndex(i);
  }, [key]);

  const currentQuestion = ALL_QUESTIONS[questionIndex] ?? null;
  const questionComplete = currentQuestion
    ? Boolean(answers[currentQuestion.id])
    : false;
  const canBack = questionIndex > 0;
  const isLast = questionIndex === TOTAL_QUESTIONS - 1;
  const canNext = questionComplete;
  const answeredCount = Object.keys(answers).filter((id) => answers[id]).length;
  const stepsCompleted = Math.max(questionIndex + 1, answeredCount);
  const progress = Math.max(
    5,
    Math.min(100, (stepsCompleted / TOTAL_QUESTIONS) * 100)
  );

  const setAnswer = useCallback(
    (questionId: string, value: string) => {
      setAnswersState((prev) => {
        const next = { ...prev, [questionId]: value };
        saveDraft(key, next, questionIndex);
        return next;
      });
    },
    [key, questionIndex]
  );

  const next = useCallback(() => {
    if (questionIndex < TOTAL_QUESTIONS - 1) {
      const newIndex = questionIndex + 1;
      setQuestionIndex(newIndex);
      setAnswersState((prev) => {
        saveDraft(key, prev, newIndex);
        return prev;
      });
    }
  }, [questionIndex, key]);

  const back = useCallback(() => {
    if (questionIndex > 0) {
      const newIndex = questionIndex - 1;
      setQuestionIndex(newIndex);
      setAnswersState((prev) => {
        saveDraft(key, prev, newIndex);
        return prev;
      });
    }
  }, [questionIndex, key]);

  const reset = useCallback(() => {
    setQuestionIndex(0);
    setAnswersState({});
    clearDraft(key);
  }, [key]);

  return {
    questionIndex,
    answers,
    currentQuestion,
    questionComplete,
    canBack,
    canNext,
    isLast,
    progress,
    totalQuestions: TOTAL_QUESTIONS,
    setAnswer,
    next,
    back,
    reset,
  };
}
