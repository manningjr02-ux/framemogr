import { type LucideIcon } from "lucide-react";

function getScoreColor(value: number): string {
  const v = Math.max(0, Math.min(100, value));
  let hue: number;
  if (v <= 50) {
    hue = (v / 50) * 40;
  } else if (v <= 70) {
    hue = 40 + ((v - 50) / 20) * 30;
  } else {
    hue = 70 + ((v - 70) / 30) * 50;
  }
  return `hsl(${hue}, 85%, 45%)`;
}

type MetricRowProps = {
  label: string;
  value: number;
  delta?: number;
  showDelta?: boolean;
  icon?: LucideIcon;
  tooltip?: string;
  isWeakest?: boolean;
  isHighest?: boolean;
};

export default function MetricRow({
  label,
  value,
  delta = 0,
  showDelta = false,
  icon: Icon,
  tooltip,
  isWeakest = false,
  isHighest = false,
}: MetricRowProps) {
  const rowClasses = [
    "group relative rounded-lg px-3 py-2 -mx-3 -my-1 transition-colors",
    isWeakest && "bg-amber-500/10 ring-1 ring-amber-500/30",
    isHighest &&
      "bg-cyan-500/8 ring-1 ring-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.12)]",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClasses}>
      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 text-zinc-400">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-zinc-500" />}
          {label}
          {isWeakest && (
            <span className="rounded bg-amber-500/30 px-1.5 py-0.5 text-xs font-medium text-amber-300">
              🔻 Biggest Leak
            </span>
          )}
        </span>
        <span className="flex items-center gap-1.5 font-bold text-white">
          {value}
          {showDelta && delta > 0 && (
            <span className="text-sm font-medium text-cyan-400">+{delta}</span>
          )}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isWeakest ? "shadow-[0_0_10px_rgba(245,158,11,0.5)]" : ""
          } ${isHighest ? "shadow-[0_0_8px_rgba(34,211,238,0.3)]" : ""}`}
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            backgroundColor: getScoreColor(value),
          }}
        />
      </div>
      {tooltip && (
        <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden max-w-[220px] rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-300 shadow-xl ring-1 ring-zinc-700 group-hover:block">
          {tooltip}
        </div>
      )}
    </div>
  );
}
