"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { X, Flame } from "lucide-react";
import html2canvas from "html2canvas";
import { getMyEntitlement, hasPaidAccess } from "@/src/lib/entitlements";

type MogCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentScore: number;
  potentialScore: number;
  currentRank: number;
  totalPeople: number;
  lowestMetric: string;
};

export default function MogCardModal({
  isOpen,
  onClose,
  currentScore,
  potentialScore,
  currentRank,
  totalPeople,
  lowestMetric,
}: MogCardModalProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    getMyEntitlement().then((ent) => setHasAccess(hasPaidAccess(ent)));
  }, [isOpen]);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#000",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `mog-card-${currentScore}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mog-card-title"
    >
      {/* Blurred backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
      />

      {/* Modal panel */}
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id="mog-card-title" className="mb-6 text-xl font-bold text-white">
          Mog Card
        </h2>

        {/* Card to capture */}
        <div
          ref={cardRef}
          className="rounded-2xl border-2 border-cyan-400/80 bg-black p-8 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          style={{ minWidth: 280 }}
        >
          <div className="flex items-center justify-center gap-2 text-cyan-400">
            <Flame className="h-8 w-8" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Frame Mog
            </span>
          </div>
          <p
            className="mt-6 text-center font-bold text-white"
            style={{ fontSize: "72px", lineHeight: 1 }}
          >
            {currentScore}
          </p>
          <p className="mt-2 text-center text-zinc-400">Mog Score</p>
          <div className="mt-8 space-y-3 text-center text-sm text-zinc-300">
            <p>
              Rank: <span className="font-semibold text-white">#{currentRank}</span>/
              {totalPeople}
            </p>
            <p>
              Biggest Leak: <span className="font-semibold text-amber-400">{lowestMetric}</span>
            </p>
            <p>
              Potential: <span className="font-semibold text-cyan-400">{potentialScore}</span>
            </p>
          </div>
          <p className="mt-8 text-center text-xs text-zinc-500">framrmog.com</p>
        </div>

        {hasAccess === false ? (
          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-zinc-400">
              Unlock to download Mog Card
            </p>
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/paywall?returnTo=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? window.location.pathname + window.location.search
                      : "/results"
                  )}`
                )
              }
              className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-black transition hover:bg-cyan-400"
            >
              Unlock Mog Card
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || hasAccess !== true}
            className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-60"
          >
            {downloading ? "Generating…" : "Download PNG"}
          </button>
        )}
      </div>
    </div>
  );
}

type MogCardTriggerProps = Omit<MogCardModalProps, "isOpen" | "onClose"> & {
  trigger?: ReactNode;
};

export function MogCardTrigger({
  trigger,
  ...modalProps
}: MogCardTriggerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  async function handleTriggerClick() {
    const ent = await getMyEntitlement();
    if (!hasPaidAccess(ent)) {
      router.push(
        `/paywall?returnTo=${encodeURIComponent(
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "/results"
        )}`
      );
      return;
    }
    setIsOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleTriggerClick}
        className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:bg-cyan-500/20"
      >
        {trigger ?? "Generate Mog Card"}
      </button>
      <MogCardModal
        {...modalProps}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
