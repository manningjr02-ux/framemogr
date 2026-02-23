"use client";

import { useEffect, useState } from "react";

const PHASES = [
  "Scanning camera bias...",
  "Mapping posture control...",
  "Measuring aura expression...",
  "Detecting lens favoritism...",
  "Comparing frame authority...",
  "Calculating dominance delta...",
  "Identifying biggest leak...",
  "Finalizing ranking...",
];

const TENSION_LINES = [
  "Someone is pulling ahead...",
  "Camera angle is favoring someone...",
  "Dominance gap detected...",
  "Finalizing verdict...",
];

const TAGS = [
  "+3 dominance",
  "Lens favored",
  "Posture penalty",
  "Aura boost",
  "+2 frame",
  "Angle advantage",
];

const NODE_POSITIONS = [
  { top: "22%", left: "18%" },
  { top: "30%", left: "58%" },
  { top: "55%", left: "25%" },
  { top: "60%", left: "65%" },
  { top: "38%", left: "42%" },
  { top: "75%", left: "50%" },
];

type Props = {
  showVerdictReady: boolean;
};

export default function AnalyzingCinematic({ showVerdictReady }: Props) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [tensionIndex, setTensionIndex] = useState(0);
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tagNodeIndex, setTagNodeIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phaseVisible, setPhaseVisible] = useState(true);
  const [tensionVisible, setTensionVisible] = useState(true);

  // Phase rotation (800–900ms)
  useEffect(() => {
    const t = setInterval(() => {
      setPhaseVisible(false);
      setTimeout(() => {
        setPhaseIndex((i) => (i + 1) % PHASES.length);
        setPhaseVisible(true);
      }, 200);
    }, 850);
    return () => clearInterval(t);
  }, []);

  // Tension rotation (~1200ms)
  useEffect(() => {
    const t = setInterval(() => {
      setTensionVisible(false);
      setTimeout(() => {
        setTensionIndex((i) => (i + 1) % TENSION_LINES.length);
        setTensionVisible(true);
      }, 150);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  // Active node + tag cycle (~700–1000ms)
  useEffect(() => {
    const cycle = () => {
      const nextNode = Math.floor(Math.random() * NODE_POSITIONS.length);
      setActiveNodeIndex(nextNode);
      setTagNodeIndex(nextNode);
      setActiveTag(TAGS[Math.floor(Math.random() * TAGS.length)]);
      setTimeout(() => setActiveTag(null), 600);
    };
    cycle();
    const t = setInterval(cycle, 850);
    return () => clearInterval(t);
  }, []);

  // Staged progress bar: 0→70 @1s, 70→85 @2.3s, pause ~450ms, 85→100 @3.2s
  useEffect(() => {
    const t1 = setTimeout(() => setProgress(70), 1000);
    const t2 = setTimeout(() => setProgress(85), 2300);
    const t3 = setTimeout(() => setProgress(100), 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (showVerdictReady) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <h2 className="analyzing-title-glow text-4xl font-bold tracking-[0.2em] text-cyan-400 sm:text-5xl md:text-6xl">
          VERDICT READY
        </h2>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center px-4 py-8 sm:py-12">
      {/* A) Big title */}
      <h1
        className="analyzing-title-shimmer analyzing-title-glow text-center text-3xl font-bold tracking-[0.15em] sm:text-4xl md:text-5xl"
        style={{ WebkitTextFillColor: "transparent" }}
      >
        ANALYZING FRAME DOMINANCE
      </h1>

      {/* B) Rotating phase */}
      <p
        className="mt-6 min-h-[2rem] text-lg text-cyan-400/90 transition-opacity duration-200"
        style={{ opacity: phaseVisible ? 1 : 0 }}
      >
        {PHASES[phaseIndex]}
      </p>

      {/* C) Fake face scan panel */}
      <div className="noise-overlay card-hover relative mt-10 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
        <div className="relative aspect-[4/3] w-full">
          {/* Blurred placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-600 to-zinc-800 blur-md" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Scan line - CSS animation moves it top→bottom */}
          <div className="analyzing-scan-line absolute left-0 right-0 h-0.5 bg-cyan-400/40" />

          {/* Face nodes */}
          {NODE_POSITIONS.map((pos, i) => (
            <div
              key={i}
              className={`absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                i === activeNodeIndex
                  ? "analyzing-node-pulse border-cyan-400 bg-cyan-500/30"
                  : "border-cyan-500/30 bg-cyan-500/10"
              }`}
              style={{ top: pos.top, left: pos.left }}
            />
          ))}

          {/* Event tag near active node */}
          {activeTag && (
            <div
              className="absolute -translate-x-1/2 -translate-y-full animate-pulse rounded-md bg-cyan-500/20 px-2 py-1 text-xs font-medium text-cyan-300"
              style={{
                top: `calc(${NODE_POSITIONS[tagNodeIndex].top} - 20px)`,
                left: NODE_POSITIONS[tagNodeIndex].left,
              }}
            >
              {activeTag}
            </div>
          )}
        </div>
      </div>

      {/* D) Progress bar */}
      <div className="mt-8 w-full max-w-md">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-cyan-500/80 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* E) Tension microcopy */}
      <p
        className="mt-6 min-h-[1.5rem] text-sm text-zinc-500 transition-opacity duration-200"
        style={{ opacity: tensionVisible ? 1 : 0 }}
      >
        {TENSION_LINES[tensionIndex]}
      </p>
    </div>
  );
}
