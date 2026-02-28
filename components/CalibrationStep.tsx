"use client";

import { motion } from "framer-motion";
import CalibrationTile from "@/components/CalibrationTile";
import type { CalibrationAnswers } from "@/lib/calibrationSchema";
import type { CALIBRATION_STEPS } from "@/lib/calibrationSchema";

type StepDef = (typeof CALIBRATION_STEPS)[number];

type Props = {
  step: StepDef;
  answers: CalibrationAnswers;
  onSelect: (key: keyof CalibrationAnswers, value: string) => void;
};

export default function CalibrationStep({ step, answers, onSelect }: Props) {
  const selected = answers[step.key];

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {step.title}
        </h2>
        <p className="mt-2 text-zinc-400">{step.subtitle}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {step.options.map((opt, i) => (
          <CalibrationTile
            key={opt.id}
            id={opt.id}
            label={opt.label}
            selected={selected === opt.id}
            onSelect={() => onSelect(step.key, opt.id)}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  );
}
