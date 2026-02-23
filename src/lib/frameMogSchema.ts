/**
 * FrameMog v2 schema: types, validation, and sanitization.
 * Never throws — always returns a valid FrameMogV2 or safe fallback.
 */

const SCORE_BREAKDOWN_KEYS = [
  "frame",
  "posture",
  "presence",
  "composition",
  "expression",
  "style",
] as const;

export type ScoreBreakdownKey = (typeof SCORE_BREAKDOWN_KEYS)[number];

export type ScoreBreakdown = Record<ScoreBreakdownKey, number>;

export type FrameMogV2 = {
  photo_type: string;
  overall_score: number;
  potential_score: number;
  score_breakdown: ScoreBreakdown;
  insights: string[];
  top_1_move: string;
};

const DEFAULT_SCORE_BREAKDOWN: ScoreBreakdown = {
  frame: 50,
  posture: 50,
  presence: 50,
  composition: 50,
  expression: 50,
  style: 50,
};

export const DEFAULT_FALLBACK: FrameMogV2 = {
  photo_type: "unknown",
  overall_score: 50,
  potential_score: 50,
  score_breakdown: { ...DEFAULT_SCORE_BREAKDOWN },
  insights: [
    "Analysis unavailable.",
    "Please try again.",
    "Upload a clear photo for best results.",
  ],
  top_1_move: "Retake with improved framing.",
};

function isScoreBreakdown(val: unknown): val is Record<string, number> {
  if (!val || typeof val !== "object") return false;
  const o = val as Record<string, unknown>;
  if (Object.keys(o).length !== 6) return false;
  for (const k of SCORE_BREAKDOWN_KEYS) {
    if (!(k in o) || typeof o[k] !== "number") return false;
  }
  return true;
}

function isStringArray(arr: unknown, min: number, max: number): arr is string[] {
  if (!Array.isArray(arr)) return false;
  if (arr.length < min || arr.length > max) return false;
  return arr.every((x) => typeof x === "string");
}

/**
 * Validates unknown input as FrameMogV2. Never throws.
 * Returns the input (as FrameMogV2) if valid, otherwise DEFAULT_FALLBACK.
 */
export function validateFrameMogV2(input: unknown): FrameMogV2 {
  try {
    if (!input || typeof input !== "object") return DEFAULT_FALLBACK;
    const o = input as Record<string, unknown>;

    const photo_type = o.photo_type;
    if (typeof photo_type !== "string") return DEFAULT_FALLBACK;

    const overall_score = o.overall_score;
    if (typeof overall_score !== "number" || Number.isNaN(overall_score))
      return DEFAULT_FALLBACK;

    const potential_score = o.potential_score;
    if (typeof potential_score !== "number" || Number.isNaN(potential_score))
      return DEFAULT_FALLBACK;

    const score_breakdown = o.score_breakdown;
    if (!isScoreBreakdown(score_breakdown)) return DEFAULT_FALLBACK;

    const insights = o.insights;
    if (!isStringArray(insights, 3, 6)) return DEFAULT_FALLBACK;

    const top_1_move = o.top_1_move;
    if (typeof top_1_move !== "string") return DEFAULT_FALLBACK;

    return {
      photo_type,
      overall_score,
      potential_score,
      score_breakdown: { ...score_breakdown } as ScoreBreakdown,
      insights: [...insights],
      top_1_move,
    };
  } catch {
    return DEFAULT_FALLBACK;
  }
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

/**
 * Clamps and sanitizes a FrameMogV2. Never throws.
 * - Scores 0–100
 * - potential_score >= overall_score
 * - If overall deviates >12 from avg(metrics) → correct overall to avg
 * - Cap potential delta: 30 (or 35 if overall < 50)
 */
export function clampAndSanitizeFrameMogV2(
  input: FrameMogV2 | unknown
): FrameMogV2 {
  try {
    const v = validateFrameMogV2(input);
    const breakdown = v.score_breakdown;

    // Clamp each metric 0–100
    const clamped: ScoreBreakdown = {} as ScoreBreakdown;
    for (const k of SCORE_BREAKDOWN_KEYS) {
      clamped[k] = clamp(breakdown[k] ?? 50, 0, 100);
    }

    const avg =
      (clamped.frame +
        clamped.posture +
        clamped.presence +
        clamped.composition +
        clamped.expression +
        clamped.style) /
      6;
    const avgRounded = Math.round(avg);

    let overall = clamp(v.overall_score, 0, 100);
    if (Math.abs(overall - avgRounded) > 12) {
      overall = avgRounded;
    }

    let potential = clamp(v.potential_score, 0, 100);
    if (potential < overall) potential = overall;

    const maxDelta = overall < 50 ? 35 : 30;
    const delta = potential - overall;
    if (delta > maxDelta) potential = overall + maxDelta;

    // Ensure insights length 3–6
    const insights = Array.isArray(v.insights)
      ? (v.insights.filter((x) => typeof x === "string") as string[])
      : DEFAULT_FALLBACK.insights;
    const trimmed =
      insights.length > 6
        ? insights.slice(0, 6)
        : insights.length < 3
          ? [
              ...insights,
              ...DEFAULT_FALLBACK.insights.slice(0, 3 - insights.length),
            ]
          : insights;

    return {
      photo_type: typeof v.photo_type === "string" ? v.photo_type : "unknown",
      overall_score: overall,
      potential_score: potential,
      score_breakdown: clamped,
      insights: trimmed,
      top_1_move:
        typeof v.top_1_move === "string" ? v.top_1_move : DEFAULT_FALLBACK.top_1_move,
    };
  } catch {
    return DEFAULT_FALLBACK;
  }
}
