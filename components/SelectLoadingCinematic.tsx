"use client";

import { useEffect, useState } from "react";

const PHASES = [
  "Detecting faces...",
  "Locking onto frame competitors...",
  "Estimating camera bias...",
  "Mapping face positions...",
  "Assigning competitor labels...",
  "Finalizing selection targets...",
];

const TENSION_LINES = [
  "Choosing who the camera favored...",
  "Finding the strongest frame...",
  "Building the dominance ranking...",
  "Almost ready...",
];

const TAGS = [
  "TARGET FOUND",
  "COMPETITOR LOCKED",
  "LENS FAVOR?",
  "AURA SIGNAL",
  "+FRAME THREAT",
  "RANKING SOON",
];

const BOXES = [
  { top: "18%", left: "18%", w: "18%", h: "22%" },
  { top: "22%", left: "45%", w: "16%", h: "20%" },
  { top: "20%", left: "72%", w: "15%", h: "18%" },
  { top: "52%", left: "28%", w: "17%", h: "21%" },
  { top: "55%", left: "55%", w: "16%", h: "19%" },
  { top: "50%", left: "78%", w: "14%", h: "17%" },
];

type Props = {
  showFinalText: boolean;
};

export default function SelectLoadingCinematic({ showFinalText }: Props) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseVisible, setPhaseVisible] = useState(true);
  const [tensionIndex, setTensionIndex] = useState(0);
  const [tensionVisible, setTensionVisible] = useState(true);
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tagBoxIndex, setTagBoxIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Phase rotation (~800ms)
  useEffect(() => {
    const t = setInterval(() => {
      setPhaseVisible(false);
      setTimeout(() => {
        setPhaseIndex((i) => (i + 1) % PHASES.length);
        setPhaseVisible(true);
      }, 200);
    }, 800);
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

  // Active box + tag cycle (~700–1000ms)
  useEffect(() => {
    const cycle = () => {
      const nextBox = Math.floor(Math.random() * BOXES.length);
      setActiveBoxIndex(nextBox);
      setTagBoxIndex(nextBox);
      setActiveTag(TAGS[Math.floor(Math.random() * TAGS.length)]);
      setTimeout(() => setActiveTag(null), 600);
    };
    cycle();
    const t = setInterval(cycle, 850);
    return () => clearInterval(t);
  }, []);

  // Progress bar: 0→80 @1.2s, 80→92 @900ms, pause 300ms, 92→100
  useEffect(() => {
    const t1 = setTimeout(() => setProgress(80), 1200);
    const t2 = setTimeout(() => setProgress(92), 2100);
    const t3 = setTimeout(() => setProgress(100), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (showFinalText) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <h2 className="select-title-glow text-4xl font-bold tracking-[0.2em] text-cyan-400 sm:text-5xl md:text-6xl">
          COMPETITORS FOUND
        </h2>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center px-4 py-8 sm:py-12">
      {/* A) Title - exact word "Select" */}
      <h1
        className="select-title-shimmer select-title-glow text-center text-3xl font-bold tracking-[0.12em] sm:text-4xl md:text-5xl"
        style={{ WebkitTextFillColor: "transparent" }}
      >
        Select
      </h1>

      {/* B) Rotating phase */}
      <p
        className="mt-6 min-h-[2rem] text-lg text-cyan-400/90 transition-opacity duration-200"
        style={{ opacity: phaseVisible ? 1 : 0 }}
      >
        {PHASES[phaseIndex]}
      </p>

      {/* C) Competitor scan panel */}
      <div className="select-noise-overlay card-hover relative mt-10 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
        <div className="relative aspect-[4/3] w-full">
          {/* Blurred placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-600 to-zinc-800 blur-md" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Face detection boxes */}
          {BOXES.map((box, i) => (
            <div
              key={i}
              className={`absolute rounded-lg border-2 ${
                i === activeBoxIndex
                  ? "select-box-pulse border-cyan-400 bg-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                  : "border-cyan-500/30 bg-cyan-500/5"
              }`}
              style={{
                top: box.top,
                left: box.left,
                width: box.w,
                height: box.h,
              }}
            >
              {/* LOCK corner brackets */}
              <span className="absolute -top-0.5 -left-0.5 text-[8px] text-cyan-400">
                &#91;
              </span>
              <span className="absolute -top-0.5 -right-0.5 text-[8px] text-cyan-400">
                &#93;
              </span>
            </div>
          ))}

          {/* ID Tag near active box */}
          {activeTag && (() => {
            const box = BOXES[tagBoxIndex];
            const centerX = parseFloat(box.left) + parseFloat(box.w) / 2;
            return (
              <div
                className="absolute -translate-x-1/2 -translate-y-full animate-pulse rounded-md border border-cyan-500/50 bg-cyan-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300"
                style={{
                  top: box.top,
                  left: `${centerX}%`,
                }}
              >
                {activeTag}
              </div>
            );
          })()}
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
