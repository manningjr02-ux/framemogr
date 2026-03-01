"use client";

import Link from "next/link";

type PaywallCardProps = {
  onStartTrial: () => void;
  startTrialLoading?: boolean;
};

const BENEFITS = [
  "Full Mog Score breakdown with frame leak analysis",
  "Personalized improvement moves and ranking insights",
  "Downloadable Mog Card to share or compare",
  "Unlimited re-runs with new photos",
];

export default function PaywallCard({
  onStartTrial,
  startTrialLoading = false,
}: PaywallCardProps) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-8 shadow-xl backdrop-blur-sm sm:p-10">
      <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
        Unlock Your Mog Card
      </h2>
      <p className="mt-4 text-center text-zinc-400">
        3-day free trial, then $6.99/week. Cancel anytime.
      </p>

      <ul className="mt-8 space-y-3">
        {BENEFITS.map((benefit, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
              ✓
            </span>
            {benefit}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onStartTrial}
        disabled={startTrialLoading}
        className="mt-8 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {startTrialLoading ? "Redirecting…" : "Start Free Trial"}
      </button>

      <Link
        href="/"
        className="mt-4 block w-full text-center text-sm text-zinc-400 hover:text-zinc-300"
      >
        Not now
      </Link>

      <p className="mt-6 text-center text-xs text-zinc-500">
        Secure checkout via Stripe
      </p>
    </div>
  );
}
