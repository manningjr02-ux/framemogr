"use client";

import { motion } from "framer-motion";

type Props = {
  id: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  index?: number;
};

export default function CalibrationTile({
  id,
  label,
  selected,
  onSelect,
  index = 0,
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={`w-full rounded-xl border px-6 py-4 text-left transition ${
        selected
          ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-100 ring-1 ring-cyan-400/30"
          : "border-zinc-700/80 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
      }`}
      data-calibration-tile={id}
    >
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}
