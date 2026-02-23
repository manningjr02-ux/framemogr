type LeaderboardItem = {
  rank: number;
  label: string;
  dominance_score: number | null;
  isYou?: boolean;
};

type LeaderboardProps = {
  items: LeaderboardItem[];
  totalPeople?: number;
  userRank?: number | null;
  scoring?: boolean;
};

export default function Leaderboard({
  items,
  totalPeople: totalPeopleProp,
  userRank,
  scoring = false,
}: LeaderboardProps) {
  const totalPeople = totalPeopleProp ?? items.length;
  const currentRank = userRank ?? items.find((i) => i.isYou)?.rank ?? 0;
  const outrankCount = Math.max(0, totalPeople - currentRank);

  return (
    <section className="rounded-xl p-[1px] card-gradient-border">
      <div className="noise-overlay card-hover rounded-[11px] border border-zinc-700/80 bg-zinc-900/60 p-6 transition-[border-color] duration-200 hover:border-zinc-500/60">
        <h2 className="text-2xl font-bold sm:text-3xl">🔥 DOMINANCE RANKING</h2>
        <p className="mt-2 text-zinc-400">
          {scoring
            ? "Scoring…"
            : currentRank === 1
              ? "You're #1. Nobody is mogging you."
              : `You outrank ${outrankCount} of ${totalPeople} in this frame.`}
        </p>
        <div className="mt-6 space-y-3">
          {items.map(({ rank, label, dominance_score, isYou }) => (
            <div
              key={label}
              className={`flex items-center justify-between rounded-lg border px-6 py-4 transition-all duration-200 hover:-translate-y-1 ${
                rank === 1
                  ? "animate-pulse border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:border-cyan-500"
                  : isYou
                    ? "border-cyan-500 bg-cyan-500/10 hover:border-cyan-500"
                    : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500"
              }`}
            >
              <span className="flex items-center gap-2 text-2xl font-bold">
                {rank === 1 ? (
                  <>
                    <span className="text-amber-400">🔥</span>
                    <span className="text-cyan-400">#{rank}</span>
                  </>
                ) : (
                  <span className="text-zinc-400">#{rank}</span>
                )}
              </span>
              <span className="text-xl font-medium text-white">
                {label}
                {isYou && (
                  <span className="ml-2 text-sm font-normal text-cyan-400">
                    (you)
                  </span>
                )}
              </span>
              <span className="text-2xl font-bold text-white">
                {dominance_score !== null && dominance_score !== undefined
                  ? dominance_score
                  : "Scoring…"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
