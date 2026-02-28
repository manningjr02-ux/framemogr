"use client";

import { motion } from "framer-motion";

type Props = {
  progress: number;
};

export default function CalibrationProgress({ progress }: Props) {
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full border border-zinc-800/80 bg-zinc-950/40">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
        animate={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
    </div>
  );
}
