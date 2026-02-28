"use client";

import type { ComponentType } from "react";
import { MapPin, Target, Sun, Scale } from "lucide-react";
import { motion } from "framer-motion";
import type { CalibrationQuestion } from "@/src/lib/calibrate/types";
import CalibrationChoiceGrid from "./CalibrationChoiceGrid";

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  context: MapPin,
  intent: Target,
  signals: Sun,
  alignment: Scale,
};

const QUESTION_HELPER: Partial<Record<string, string>> = {
  photo_setting:
    "Different environments shift how dominance is perceived.",
  posed_level:
    "Candid posture reads differently than posed posture.",
  camera_distance:
    "Wide lenses exaggerate proportions.",
  camera_awareness:
    "Micro-adjustments happen when you know the camera is there.",
  posture_state:
    "Posture expansion directly affects frame authority.",
  camera_angle_intent:
    "Body angle changes how width and structure read.",
  trying_to_look_good:
    "Intent often changes facial tension and stance.",
  centered_in_frame:
    "Center bias increases visual weight.",
  lighting_face:
    "Lighting controls facial contrast and definition.",
  grooming:
    "Preparation impacts sharpness under flash.",
  tired_stressed:
    "Fatigue subtly alters facial signal clarity.",
  predicted_rank_bucket:
    "We compare predicted vs measured dominance.",
  primary_goal:
    "This tailors how your results are presented.",
  share_intent:
    "High scores tend to be shared.",
};

type Props = {
  question: CalibrationQuestion;
  category?: string;
  value: string | undefined;
  onSelect: (choiceId: string) => void;
  index?: number;
};

function idToLabel(id: string): string {
  return id.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function CalibrationQuestionCard({
  question,
  category,
  value,
  onSelect,
  index = 0,
}: Props) {
  const title = question.label ?? idToLabel(question.id);
  const status = value ? "set" : "pending";
  const helper = QUESTION_HELPER[question.id];
  const Icon = category ? CATEGORY_ICONS[category] : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {Icon && (
            <Icon
              className="h-[18px] w-[18px] shrink-0 text-sky-300 opacity-80"
              aria-hidden
            />
          )}
          <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        </div>
        <span className={"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium " + (status === "set" ? "bg-cyan-500/20 text-cyan-300" : "bg-zinc-700/60 text-zinc-500")}>
          {status}
        </span>
      </div>
      {helper && (
        <p className="mb-3 text-xs text-zinc-500">{helper}</p>
      )}
      <CalibrationChoiceGrid question={question} value={value} onSelect={onSelect} />
    </motion.div>
  );
}
