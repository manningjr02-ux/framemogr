"use client";

import { motion } from "framer-motion";

type Person = {
  label: string;
  dominance_score: number;
  sort_order: number;
  crop_box: { x: number; y: number; w: number; h: number };
};

type ScoreOverlayProps = {
  imageUrl: string;
  people: Person[];
  imageWidth: number;
  imageHeight: number;
  showRank?: boolean;
};

export default function ScoreOverlay({
  imageUrl,
  people,
  imageWidth,
  imageHeight,
  showRank = true,
}: ScoreOverlayProps) {
  const aspectRatio = imageWidth / imageHeight;

  const maxScore =
    people.length > 0 ? Math.max(...people.map((p) => p.dominance_score)) : 0;
  const firstMaxIndex =
    maxScore > 0 ? people.findIndex((p) => p.dominance_score === maxScore) : -1;
  const getRank = (score: number) =>
    1 + people.filter((p) => p.dominance_score > score).length;

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-zinc-900"
      style={{ aspectRatio }}
    >
      <img
        src={imageUrl}
        alt="Group photo with frame scores"
        className="h-full w-full object-contain"
        crossOrigin="anonymous"
      />
      {people.map((person, i) => {
        const { crop_box } = person;
        if (!crop_box || typeof crop_box.x !== "number") return null;

        const centerX = crop_box.x + crop_box.w / 2;
        const topY = crop_box.y;
        const offsetUp = 0.06;
        const badgeTop = Math.max(0.02, (topY - offsetUp) * 100);
        const badgeLeft = centerX * 100;

        const rank = getRank(person.dominance_score);
        const isTopMogger =
          maxScore > 0 && people.findIndex((p) => p.label === person.label) === firstMaxIndex;

        return (
          <motion.div
            key={person.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{
              left: `${badgeLeft}%`,
              top: `${badgeTop}%`,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: isTopMogger ? 1.1 : 1 }}
              transition={{ duration: 0.35, delay: i * 0.08 + 0.05 }}
              className={`flex flex-col items-center justify-center rounded-full bg-black/70 px-2.5 py-1 ${
                isTopMogger
                  ? "border-[4px] border-amber-500/60 shadow-xl"
                  : "border border-zinc-500/50 shadow-md"
              }`}
            >
              <span className="font-bold text-white tabular-nums leading-tight">
                {person.dominance_score}
              </span>
              {showRank && (
                <span className="text-[9px] leading-tight text-white/70">
                  #{rank}
                </span>
              )}
            </motion.div>
          </motion.div>
        );
      })}
      <div className="absolute bottom-2 left-2 text-[10px] font-medium text-white/60">
        framrmog
      </div>
      <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-zinc-400">
        Frame Score
      </div>
    </div>
  );
}
