"use client";

import { useEffect, useState } from "react";

type ScoreDeltaProps = {
  currentScore: number;
  potentialScore: number;
  potentialDelta: number;
  yourRank: number;
  totalPeople: number;
};

const SCALE_MAX = 100;

export default function ScoreDelta({
  currentScore,
  potentialScore,
  potentialDelta,
  yourRank,
  totalPeople,
}: ScoreDeltaProps) {
  const [fillWidth, setFillWidth] = useState(0);
  const leakPoints = Math.max(0, potentialScore - currentScore);
  const currentPct = Math.min(SCALE_MAX, Math.max(0, currentScore)) / SCALE_MAX;
  const potentialPct = Math.min(SCALE_MAX, Math.max(0, potentialScore)) / SCALE_MAX;

  useEffect(() => {
    const t = setTimeout(() => setFillWidth(currentPct * 100), 50);
    return () => clearTimeout(t);
  }, [currentPct]);

  return (
    <section className="rounded-xl p-[1px] card-gradient-border">
      <div className="noise-overlay card-hover rounded-[11px] border border-cyan-500/40 bg-cyan-500/5 p-6 transition-[border-color] duration-200 hover:border-cyan-500/60 sm:p-8">
      <h2 className="text-2xl font-bold sm:text-3xl">Your Score</h2>
      <div className="mt-6 space-y-4">
        <p className="text-xl">
          <span className="text-zinc-400">Your Mog Score: </span>
          <span className="font-bold text-white">{currentScore}</span>
        </p>
        <p className="text-xl">
          <span className="text-zinc-400">Optimized Potential: </span>
          <span className="font-bold text-cyan-400">{potentialScore}</span>
        </p>
        <p className="text-lg text-cyan-400">
          You&apos;re leaking {leakPoints} dominance points.
        </p>

        <div className="pt-2">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-cyan-500/80 transition-all duration-700 ease-out"
              style={{ width: `${fillWidth}%` }}
            />
            {potentialPct > currentPct && (
              <div
                className="absolute top-0 h-full w-0.5 bg-cyan-400"
                style={{ left: `${potentialPct * 100}%`, transform: "translateX(-50%)" }}
              />
            )}
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {currentScore} → {potentialScore}
          </p>
        </div>

        <p className="text-lg text-zinc-400">
          Rank: <span className="font-semibold text-white">#{yourRank}</span> of{" "}
          {totalPeople}
        </p>
      </div>
      </div>
    </section>
  );
}
