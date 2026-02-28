"use client";

type Props = {
  canBack: boolean;
  canNext: boolean;
  isLast: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
};

export default function CalibrationNav({
  canBack,
  canNext,
  isLast,
  submitting,
  onBack,
  onNext,
}: Props) {
  const primaryLabel = submitting
    ? "Applying calibration..."
    : isLast
      ? "Apply Calibration"
      : "Continue";
  return (
    <div>
      <div className="flex items-center justify-between gap-4 pt-2">
        <button type="button" onClick={onBack} disabled={!canBack} className="rounded-lg border border-zinc-600 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:pointer-events-none disabled:opacity-40">Back</button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext || submitting}
          className="rounded-full bg-cyan-500 px-8 py-2.5 font-semibold text-black shadow-md shadow-cyan-500/20 transition-all duration-200 hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-400/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-cyan-500 disabled:hover:shadow-md disabled:active:scale-100"
        >
          {primaryLabel}
        </button>
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        We adjust for context and camera bias to improve accuracy.
      </p>
    </div>
  );
}
