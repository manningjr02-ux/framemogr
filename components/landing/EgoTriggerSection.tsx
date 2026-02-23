import Container from "@/components/Container";

export default function EgoTriggerSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-lg sm:p-14">
          <h2 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">
            Think you&apos;re not getting mogged?
          </h2>
          <p className="mt-6 text-center text-lg text-zinc-400 sm:text-xl">
            The lens doesn&apos;t treat everyone equally.
          </p>
          <ul className="mt-10 space-y-4 sm:mx-auto sm:max-w-md">
            <li className="flex items-center gap-3 text-zinc-200">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                1
              </span>
              Upload the same photo.
            </li>
            <li className="flex items-center gap-3 text-zinc-200">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                2
              </span>
              See who the camera favors.
            </li>
            <li className="flex items-center gap-3 text-zinc-200">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                3
              </span>
              Fix your biggest leak.
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
