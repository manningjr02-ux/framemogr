"use client";

import { Flame, Crown } from "lucide-react";

export default function FakeDemoMockup() {
  return (
    <div className="animate-float-subtle w-full max-w-xl">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/30">
        {/* Blurred placeholder "group photo" */}
        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-zinc-700 via-zinc-600 to-zinc-800 blur-sm sm:h-44">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white/60">[ Group photo ]</span>
          </div>
        </div>

        {/* Results overlay inside mockup */}
        <div className="space-y-3 p-4 sm:p-5">
          {/* Mini leaderboard */}
          <div className="space-y-1.5">
            {[
              { rank: 1, label: "Person A", score: 92, isFirst: true },
              { rank: 2, label: "Person B", score: 88, isFirst: false },
              { rank: 3, label: "Person C", score: 81, isFirst: false },
              { rank: 4, label: "Person D", score: 76, isFirst: false },
              { rank: 5, label: "Person E", score: 71, isFirst: false },
            ].map((row) => (
              <div
                key={row.rank}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  row.isFirst
                    ? "animate-glow-pulse border border-cyan-500/40 bg-cyan-500/10"
                    : "border border-transparent bg-zinc-800/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  {row.isFirst ? (
                    <>
                      <Crown className="h-4 w-4 text-amber-400" />
                      <Flame className="h-4 w-4 text-cyan-400" />
                    </>
                  ) : null}
                  <span className={row.isFirst ? "font-semibold text-cyan-400" : "text-zinc-400"}>
                    #{row.rank}
                  </span>
                  <span className="text-white">{row.label}</span>
                </span>
                <span className="font-bold text-white">{row.score}</span>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs font-medium text-cyan-400">
              +12 dominance
            </span>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-400">
              Biggest leak: Posture Control
            </span>
          </div>

          {/* Mini score gap bar */}
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-cyan-500/80"
                style={{ width: "87%" }}
              />
            </div>
            <span className="text-xs font-semibold text-cyan-400">80 → 92</span>
          </div>
        </div>
      </div>
    </div>
  );
}
