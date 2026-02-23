import Link from "next/link";
import Container from "@/components/Container";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-6">
      <Container className="text-center">
        <p className="text-6xl font-bold tracking-tight text-cyan-400/80 sm:text-7xl md:text-8xl">
          404
        </p>
        <p className="mt-4 text-xl text-zinc-400 sm:text-2xl">
          This page could not be found.
        </p>
        <p className="mt-2 text-zinc-500">
          Lost in the frame. Head back and run it again.
        </p>
        <Link
          href="/"
          className="mt-10 inline-block rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-8 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
        >
          Back to framrmog
        </Link>
      </Container>
    </main>
  );
}
