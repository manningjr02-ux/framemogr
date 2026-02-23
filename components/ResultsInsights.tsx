"use client";

import { Lightbulb } from "lucide-react";
import type { FrameMogV2 } from "@/src/lib/frameMogSchema";

type Props = { data: FrameMogV2 };

export default function ResultsInsights({ data }: Props) {
  const insights = data.insights ?? [];
  if (insights.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl p-[1px] card-gradient-border">
      <div className="noise-overlay card-hover overflow-hidden rounded-[11px] border border-zinc-700/80 bg-zinc-900/50 p-6 transition-[border-color] duration-200 hover:border-zinc-500/60">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <Lightbulb className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-bold sm:text-2xl">Insights</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((text, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 bg-black/20 px-4 py-3"
            >
              <p className="text-zinc-200">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
