"use client";

import { Zap } from "lucide-react";
import type { FrameMogV2 } from "@/src/lib/frameMogSchema";

type Props = { data: FrameMogV2 };

export default function ResultsTopMove({ data }: Props) {
  return (
    <section className="overflow-hidden rounded-xl p-[1px] card-gradient-border">
      <div className="noise-overlay card-hover overflow-hidden rounded-[11px] border border-cyan-500/40 bg-cyan-500/10 p-6 transition-[border-color] duration-200 hover:border-cyan-500/60 sm:p-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
            <Zap className="h-5 w-5" />
          </span>
          <h2 className="text-2xl font-bold text-cyan-400 sm:text-3xl">
            Top 1 Move
          </h2>
        </div>
        <p className="text-xl font-medium text-white sm:text-2xl">
          {data.top_1_move}
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Highest-leverage change for your next shot.
        </p>
      </div>
    </section>
  );
}
