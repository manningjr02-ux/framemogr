"use client";

import { motion } from "framer-motion";
import type { CalibrationQuestionWithCategory } from "@/src/lib/calibrate/types";
import type { CalibrationAnswers } from "@/src/lib/calibrate/types";
import CalibrationQuestionCard from "./CalibrationQuestionCard";

type Props = {
  question: CalibrationQuestionWithCategory | null;
  answers: CalibrationAnswers;
  onSelect: (questionId: string, choiceId: string) => void;
};

export default function CalibrationStepRenderer({
  question,
  answers,
  onSelect,
}: Props) {
  if (!question) return null;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <CalibrationQuestionCard
        question={question}
        value={answers[question.id]}
        onSelect={(choiceId) => onSelect(question.id, choiceId)}
      />
    </motion.div>
  );
}
