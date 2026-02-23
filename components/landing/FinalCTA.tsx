import Link from "next/link";
import Container from "@/components/Container";

export default function FinalCTA() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Ready to see who owns the frame?
          </h2>
          <Link
            href="/upload"
            className="mt-10 inline-block rounded-lg bg-cyan-500 px-12 py-4 text-lg font-semibold text-black transition hover:bg-cyan-400 sm:text-xl"
          >
            Get Started
          </Link>
          <p className="mt-6 text-sm text-zinc-500">Takes ~10 seconds.</p>
        </div>
      </Container>
    </section>
  );
}
