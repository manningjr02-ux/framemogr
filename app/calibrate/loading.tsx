export default function CalibrateLoading() {
  return (
    <main className="relative flex min-h-[calc(100vh-65px)] flex-col items-center justify-center overflow-hidden py-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(34, 211, 238, 0.05) 0%, transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="noise-overlay pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="space-y-4">
            <div className="h-8 w-56 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-72 animate-pulse rounded bg-zinc-800" />
            <div className="h-2 w-full max-w-[280px] animate-pulse rounded bg-zinc-800" />
          </div>
          <div className="mt-8 flex gap-2">
            <div className="h-8 w-16 animate-pulse rounded-lg bg-zinc-800" />
            <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />
          </div>
          <div className="mt-8 space-y-6">
            <div className="h-6 w-40 animate-pulse rounded bg-zinc-800" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-zinc-800"
                />
              ))}
            </div>
          </div>
          <div className="mt-8 flex justify-between">
            <div className="h-10 w-20 animate-pulse rounded-lg bg-zinc-800" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-zinc-800" />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-500">
          Normalizing group dynamics • Adjusting camera bias
        </p>
      </div>
    </main>
  );
}
