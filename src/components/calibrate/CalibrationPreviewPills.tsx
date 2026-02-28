"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CALIBRATION_STEPS } from "@/src/lib/calibrate/steps";
import type { CalibrationAnswers } from "@/src/lib/calibrate/types";
import type { CalibrationStep } from "@/src/lib/calibrate/types";

const QUESTION_LABELS: Record<string, string> = {
  photo_setting: "Setting",
  posed_level: "Pose",
  camera_distance: "Distance",
  camera_awareness: "Awareness",
  posture_state: "Posture",
  camera_angle_intent: "Angle",
  trying_to_look_good: "Intent",
  centered_in_frame: "Position",
  lighting_face: "Lighting",
  grooming: "Grooming",
  tired_stressed: "State",
  predicted_rank_bucket: "Rank",
  primary_goal: "Goal",
  share_intent: "Share",
};

function getChoiceLabel(questionId: string, choiceId: string): string {
  for (const step of CALIBRATION_STEPS as CalibrationStep[]) {
    const q = step.questions.find((x) => x.id === questionId);
    if (q) {
      const c = q.choices.find((x) => x.id === choiceId);
      return c?.label ?? choiceId;
    }
  }
  return choiceId;
}

type Props = {
  answers: CalibrationAnswers;
  choiceLabel?: (questionId: string, choiceId: string) => string;
};

export default function CalibrationPreviewPills({
  answers,
  choiceLabel = getChoiceLabel,
}: Props) {
  const safeAnswers = answers ?? {};
  const entries: { key: string; label: string; value: string }[] = [];
  for (const step of CALIBRATION_STEPS as CalibrationStep[]) {
    for (const q of step.questions) {
      const val = safeAnswers[q.id];
      if (val) {
        entries.push({
          key: q.id,
          label: QUESTION_LABELS[q.id] ?? q.id,
          value: choiceLabel(q.id, val),
        });
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence mode="popLayout">
        {entries.length === 0 ? (
          <motion.span
            key="_placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-zinc-500"
          >
            Answers will appear here
          </motion.span>
        ) : (
          entries.map((e, i) => (
            <motion.span
              key={e.key}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-800/60 px-2.5 py-1 text-xs text-zinc-300"
            >
              <span className="text-zinc-500">{e.label}:</span>
              {e.value}
            </motion.span>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
