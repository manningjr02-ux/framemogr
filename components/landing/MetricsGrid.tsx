"use client";

import {
  Shield,
  Ruler,
  Sparkles,
  Camera,
  Activity,
  Smile,
} from "lucide-react";
import Container from "@/components/Container";

const METRICS = [
  {
    icon: Shield,
    title: "Frame Authority",
    description: "Who visually dominates the frame.",
  },
  {
    icon: Ruler,
    title: "Fit Precision",
    description: "How clean your proportions read.",
  },
  {
    icon: Sparkles,
    title: "Grooming Timing",
    description: "Hair + skin under current lighting.",
  },
  {
    icon: Camera,
    title: "Camera Positioning",
    description: "Is the lens helping or hurting you?",
  },
  {
    icon: Activity,
    title: "Posture Control",
    description: "Are you locked in or collapsing?",
  },
  {
    icon: Smile,
    title: "Aura Expression",
    description: "Confidence signal in your face.",
  },
];

export default function MetricsGrid() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          How We Rank Dominance
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="card-hover rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg transition-colors hover:border-cyan-500/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
