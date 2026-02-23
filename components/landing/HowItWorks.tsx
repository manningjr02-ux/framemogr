"use client";

import { Upload, Sparkles, Trophy } from "lucide-react";
import Container from "@/components/Container";

const STEPS = [
  {
    icon: Upload,
    title: "Upload",
    description: "Drop any group photo.",
  },
  {
    icon: Sparkles,
    title: "AI Scans",
    description: "Posture. Camera bias. Aura. Angle.",
  },
  {
    icon: Trophy,
    title: "Get Ranked",
    description: "See who's mogging who.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          How It Works
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {STEPS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="card-hover rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg transition-colors hover:border-cyan-500/20"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-zinc-400">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
