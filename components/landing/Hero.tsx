import Link from "next/link";
import Image from "next/image";
import Container from "@/components/Container";
import FakeDemoMockup from "./FakeDemoMockup";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20 pb-16">
      {/* Dark gradient + radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(34, 211, 238, 0.08) 0%, transparent 60%), linear-gradient(180deg, #0a0a0b 0%, #050506 100%)",
        }}
      />
      <div className="noise-overlay pointer-events-none absolute inset-0" />

      <Container className="relative z-10 flex flex-col items-center text-center">
        {/* Logo - power pose icon above headline */}
        <div className="mb-8 flex justify-center sm:mb-10">
          <Image
            src="/logo.png"
            alt="FrameMog"
            width={240}
            height={240}
            className="h-48 w-48 sm:h-60 sm:w-60"
            priority
          />
        </div>
        {/* Hero copy - EXACTLY as specified, do not change */}
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          Who Controls The Frame?
        </h1>
        <p className="mt-8 text-xl text-zinc-400 sm:text-2xl md:text-3xl">
          See who&apos;s farming the most frame points in any group photo.
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-4">
          <Link
            href="/upload"
            className="inline-block rounded-lg bg-cyan-500 px-10 py-4 text-lg font-semibold text-black transition hover:bg-cyan-400 sm:text-xl"
          >
            Get Started
          </Link>
          <Link
            href="/upload"
            className="inline-block rounded-lg border border-white/20 bg-white/5 px-8 py-4 text-lg font-medium text-white transition hover:bg-white/10 sm:text-xl"
          >
            See Example
          </Link>
        </div>

        {/* Fake demo mockup - below CTAs on mobile, to right on desktop */}
        <div className="mt-16 w-full max-w-xl lg:mt-20">
          <FakeDemoMockup />
        </div>
      </Container>
    </section>
  );
}
