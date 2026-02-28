"use client";

import { useState, useEffect } from "react";

const LINES = [
  "Mapping group dynamics…",
  "Adjusting for lens distortion…",
  "Measuring posture expansion…",
  "Normalizing camera bias…",
  "Calibrating expression signal…",
];

const INTERVAL_MS = 700;

export default function CalibrationScanLines() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % LINES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="mt-3 text-xs text-zinc-500" aria-live="polite">
      {LINES[index]}
    </p>
  );
}
