"use client";

import { useMemo } from "react";
import {
  Shield,
  Ruler,
  Sparkles,
  Camera,
  Activity,
  Smile,
} from "lucide-react";
import MetricRow from "@/components/MetricRow";
import { getMetricLabel } from "@/src/lib/frameMogLabels";
import type { FrameMogV2, ScoreBreakdownKey } from "@/src/lib/frameMogSchema";

const METRIC_ICONS: Record<ScoreBreakdownKey, typeof Shield> = {
  frame: Shield,
  posture: Activity,
  presence: Sparkles,
  composition: Camera,
  expression: Smile,
  style: Ruler,
};

const KEYS: ScoreBreakdownKey[] = [
  "frame",
  "posture",
  "presence",
  "composition",
  "expression",
  "style",
];

type Props = { data: FrameMogV2 };

export default function ResultsBreakdownGrid({ data }: Props) {
  const { weakestKey, highestKey } = useMemo(() => {
    const entries = KEYS.map((k) => [k, data.score_breakdown[k] ?? 0] as const);
    const min = Math.min(...entries.map(([, v]) => v));
    const max = Math.max(...entries.map(([, v]) => v));
    const weakest =
      entries.find(([, v]) => v === min)?.[0] ?? entries[0][0];
    const highest =
      entries.find(([, v]) => v === max)?.[0] ?? entries[0][0];
    return { weakestKey: weakest, highestKey: highest };
  }, [data.score_breakdown]);

  return (
    <section className="overflow-hidden rounded-xl p-[1px] card-gradient-border">
      <div className="noise-overlay card-hover overflow-hidden rounded-[11px] border border-zinc-700/80 bg-zinc-900/50 p-6 transition-[border-color] duration-200 hover:border-zinc-500/60">
        <h2 className="mb-4 text-2xl font-bold sm:text-3xl">6-Metric Breakdown</h2>
        <div className="space-y-4">
          {KEYS.map((key) => (
            <MetricRow
              key={key}
              label={getMetricLabel(data.photo_type, key)}
              value={data.score_breakdown[key] ?? 50}
              icon={METRIC_ICONS[key]}
              isWeakest={key === weakestKey}
              isHighest={key === highestKey}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
