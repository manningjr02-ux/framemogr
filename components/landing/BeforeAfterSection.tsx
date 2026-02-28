"use client";

import { ArrowRight } from "lucide-react";
import Container from "@/components/Container";

export default function BeforeAfterSection() {
  return (
    <section className="py-20 sm:py-28 bg-zinc-900/20">
      <Container>
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-12">
          {/* Before card */}
          <div className="card-hover w-full max-w-sm rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 shadow-lg transition-colors hover:border-amber-500/40">
            <p className="text-sm font-medium uppercase tracking-wider text-amber-400">
              Before
            </p>
            <p className="mt-4 text-4xl font-bold text-white">Mog Score: 74</p>
            <p className="mt-2 text-zinc-400">
              Biggest leak: Camera Positioning
            </p>
          </div>

          {/* Animated arrow - hidden on mobile */}
          <div className="hidden shrink-0 animate-pulse lg:flex">
            <ArrowRight className="h-10 w-10 text-cyan-500/60" />
          </div>

          {/* After card */}
          <div className="card-hover w-full max-w-sm rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-8 shadow-lg transition-colors hover:border-cyan-500/50">
            <p className="text-sm font-medium uppercase tracking-wider text-cyan-400">
              After
            </p>
            <p className="mt-4 text-4xl font-bold text-white">Mog Score: 88</p>
            <p className="mt-2 text-zinc-400">Fixed: posture + angle</p>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-zinc-500">
          Small adjustments = big dominance shift.
        </p>
      </Container>
    </section>
  );
}
