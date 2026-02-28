"use client";

import { motion } from "framer-motion";
import CalibrationProgress from "./CalibrationProgress";

type Props = {
  title?: string;
  subtitle?: string;
  progress: number;
};

export default function CalibrationHeader({
  title = "Calibration",
  subtitle = "Fine-tune your analysis",
  progress,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        <span className="flex items-center gap-1.5 text-xs text-cyan-400/90">
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400"
            aria-hidden
          />
          active
        </span>
      </div>
      <p className="text-sm text-zinc-400">{subtitle}</p>
      <CalibrationProgress progress={progress} />
    </motion.div>
  );
}
