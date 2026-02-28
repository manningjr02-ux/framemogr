"use client";

import { AnimatePresence, motion } from "framer-motion";
import CalibrationHeader from "./CalibrationHeader";
import CalibrationPreviewPills from "./CalibrationPreviewPills";
import CalibrationQuestionCard from "./CalibrationQuestionCard";
import CalibrationNav from "./CalibrationNav";
import CalibrationScanLines from "./CalibrationScanLines";
import { ALL_QUESTIONS } from "@/src/lib/calibrate/steps";
import type { CalibrationQuestionWithCategory } from "@/src/lib/calibrate/types";
import type { CalibrationAnswers } from "@/src/lib/calibrate/types";

const CATEGORY_LABELS: Record<string, string> = {
  context: "CONTEXT",
  intent: "INTENT",
  signals: "SIGNALS",
  alignment: "ALIGNMENT",
};

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category.toUpperCase();
}

type Props = {
  title?: string;
  subtitle?: string;
  currentQuestion: CalibrationQuestionWithCategory | null;
  questionIndex: number;
  totalQuestions: number;
  answers: CalibrationAnswers;
  progress: number;
  questionComplete: boolean;
  canBack: boolean;
  canNext: boolean;
  isLast: boolean;
  submitting: boolean;
  error: string | null;
  onSelect: (questionId: string, choiceId: string) => void;
  onBack: () => void;
  onNext: () => void;
};

function getChoiceLabel(questionId: string, choiceId: string): string {
  const q = ALL_QUESTIONS.find((x) => x.id === questionId);
  if (q) {
    const c = q.choices.find((x) => x.id === choiceId);
    return c?.label ?? choiceId;
  }
  return choiceId;
}

export default function CalibrationShell({
  title,
  subtitle,
  currentQuestion,
  questionIndex,
  totalQuestions,
  answers,
  progress,
  questionComplete,
  canBack,
  canNext,
  isLast,
  submitting,
  error,
  onSelect,
  onBack,
  onNext,
}: Props) {

  return (
    <main className="relative flex min-h-[calc(100vh-65px)] flex-col items-center justify-center overflow-hidden py-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(34, 211, 238, 0.05) 0%, transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="noise-overlay pointer-events-none absolute inset-0" />

      {submitting && (
        <div
          className="pointer-events-none absolute inset-0 z-20 opacity-30"
          aria-hidden
        >
          {/* Placeholder slot for rotating scan lines */}
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <CalibrationHeader
            title={title}
            subtitle={subtitle}
            progress={progress}
          />

          <p className="mt-2 text-right text-xs tracking-wider text-zinc-500">
            Question {questionIndex + 1} of {totalQuestions}
          </p>

          <div className="mt-6">
            <CalibrationPreviewPills
              answers={answers}
              choiceLabel={getChoiceLabel}
            />
          </div>

          {currentQuestion && (
            <div className="mt-8">
              <p className="mb-4 text-xs uppercase tracking-wider text-zinc-500">
                {getCategoryLabel(currentQuestion.category)}
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <CalibrationQuestionCard
                    question={currentQuestion}
                    category={currentQuestion.category}
                    value={answers[currentQuestion.id]}
                    onSelect={(choiceId) =>
                      onSelect(currentQuestion.id, choiceId)
                    }
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </motion.div>
          )}

          <div className="mt-8">
            <CalibrationNav
              canBack={canBack}
              canNext={questionComplete}
              isLast={isLast}
              submitting={submitting}
              onBack={onBack}
              onNext={onNext}
            />
            {submitting && <CalibrationScanLines />}
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Normalizing group dynamics • Adjusting camera bias
        </p>
      </div>
    </main>
  );
}
