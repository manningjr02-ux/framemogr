"use client";

import { motion } from "framer-motion";
import type { CalibrationQuestion } from "@/src/lib/calibrate/types";

type Props = {
  question: CalibrationQuestion;
  value: string | undefined;
  onSelect: (choiceId: string) => void;
};

export default function CalibrationChoiceGrid({
  question,
  value,
  onSelect,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {question.choices.map((choice, i) => {
        const selected = value === choice.id;
        return (
          <motion.button
            key={choice.id}
            type="button"
            onClick={() => onSelect(choice.id)}
            aria-pressed={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            whileTap={{ scale: 0.98 }}
            className={"flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 " + (selected ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.08)]" : "border-zinc-700/80 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800")}
          >
            {selected && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden />}
            <span className={selected ? "" : "ml-3.5"}>{choice.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
