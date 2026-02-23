import Link from "next/link";
import { Flame } from "lucide-react";
import Container from "@/components/Container";

export default function ShareCardPreview() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Built for Screenshots.
        </h2>
        <div className="mt-12 flex flex-col items-center">
          {/* Static Mog Card preview */}
          <div
            className="rounded-2xl border-2 border-cyan-400/80 bg-black p-8 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
            style={{ minWidth: 280, maxWidth: 320 }}
          >
            <div className="flex items-center justify-center gap-2 text-cyan-400">
              <Flame className="h-6 w-6" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Frame Mog
              </span>
            </div>
            <p className="mt-6 text-center text-6xl font-bold text-white">84</p>
            <p className="mt-2 text-center text-sm text-zinc-400">Mog Score</p>
            <div className="mt-8 space-y-2 text-center text-sm text-zinc-300">
              <p>Rank #2 / 7</p>
              <p>Biggest leak: Posture Control</p>
              <p>Potential: 92</p>
            </div>
            <p className="mt-8 text-center text-xs text-zinc-500">
              framrmog.com
            </p>
          </div>
          <Link
            href="/upload"
            className="card-hover mt-8 rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-8 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
          >
            Generate your Mog Card
          </Link>
        </div>
      </Container>
    </section>
  );
}
