/**
 * Normalizes analysis result to FrameMogV2.
 * Handles both v2 (result_v2) and v1 (ai_summary, current_score) formats.
 * Never throws — always returns a valid FrameMogV2.
 */

import {
  validateFrameMogV2,
  clampAndSanitizeFrameMogV2,
  DEFAULT_FALLBACK,
  type FrameMogV2,
  type ScoreBreakdown,
} from "@/src/lib/frameMogSchema";

const SCORE_KEYS = [
  "frame",
  "posture",
  "presence",
  "composition",
  "expression",
  "style",
] as const;

function safeNum(n: unknown, fallback: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function safeStr(s: unknown): string {
  return typeof s === "string" && s.trim().length > 0 ? s.trim() : "";
}

/** Spread overall score into 6 metrics with slight variance */
function deriveScoreBreakdown(overall: number): ScoreBreakdown {
  const base = Math.max(0, Math.min(100, Math.round(overall)));
  const delta = Math.min(8, Math.floor((100 - base) / 6));
  const offsets = [0, 1, -1, 2, -2, 0];
  const out = {} as ScoreBreakdown;
  for (let i = 0; i < SCORE_KEYS.length; i++) {
    const v = base + (offsets[i] ?? 0) * (delta || 1);
    out[SCORE_KEYS[i]] = Math.max(0, Math.min(100, v));
  }
  return out;
}

/** Collect bullets from v1 frame_leaks, doing_right, photo_context */
function collectV1Insights(aiSummary: unknown): string[] {
  const out: string[] = [];
  if (!aiSummary || typeof aiSummary !== "object") return out;
  const s = aiSummary as Record<string, unknown>;

  const frameLeaks = s.frame_leaks;
  if (Array.isArray(frameLeaks)) {
    for (const item of frameLeaks) {
      if (item && typeof item === "object" && "fix" in item) {
        const fix = safeStr((item as { fix?: unknown }).fix);
        if (fix) out.push(fix);
      }
    }
  }

  const doingRight = s.doing_right;
  if (Array.isArray(doingRight)) {
    for (const item of doingRight) {
      if (item && typeof item === "object" && "amplify" in item) {
        const amp = safeStr((item as { amplify?: unknown }).amplify);
        if (amp) out.push(amp);
      }
    }
  }

  const photoContext = s.photo_context;
  if (Array.isArray(photoContext)) {
    for (const x of photoContext) {
      const t = safeStr(x);
      if (t) out.push(t);
    }
  }

  return out;
}

/** Impact rank: HIGH=3, MEDIUM=2, LOW=1 */
function impactRank(impact: unknown): number {
  if (impact === "HIGH") return 3;
  if (impact === "MEDIUM") return 2;
  if (impact === "LOW") return 1;
  return 0;
}

/** Pick highest-impact insight (frame_leaks.fix or doing_right.amplify) */
function pickTop1Move(aiSummary: unknown): string {
  let best = { text: "", rank: 0, points: 0 };
  if (!aiSummary || typeof aiSummary !== "object") return DEFAULT_FALLBACK.top_1_move;
  const s = aiSummary as Record<string, unknown>;

  const consider = (items: unknown[], getText: (x: Record<string, unknown>) => string) => {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const text = getText(o);
      if (!text) continue;
      const rank = impactRank(o.impact);
      const points = typeof o.points === "number" ? o.points : 0;
      if (rank > best.rank || (rank === best.rank && points > best.points)) {
        best = { text, rank, points };
      }
    }
  };

  consider(s.frame_leaks as unknown[], (x) => safeStr(x.fix));
  consider(s.doing_right as unknown[], (x) => safeStr(x.amplify));

  return best.text || DEFAULT_FALLBACK.top_1_move;
}

/**
 * Normalizes analysis result to FrameMogV2.
 * - If result_v2 exists → validate + clamp + return.
 * - If v1 (ai_summary, current_score) → build synthetic FrameMogV2.
 * Never throws.
 */
export function normalizeFrameMogResult(input: unknown): FrameMogV2 {
  try {
    if (!input || typeof input !== "object") return clampAndSanitizeFrameMogV2(DEFAULT_FALLBACK);
    const o = input as Record<string, unknown>;

    const resultV2 = o.result_v2;
    if (resultV2 != null) {
      const validated = validateFrameMogV2(resultV2);
      return clampAndSanitizeFrameMogV2(validated);
    }

    const currentScore = safeNum(o.current_score, 50);
    const potentialScore = Math.min(currentScore + 15, 95);

    const insights = collectV1Insights(o.ai_summary);
    const trimmed =
      insights.length > 6
        ? insights.slice(0, 6)
        : insights.length < 3
          ? [...insights, ...DEFAULT_FALLBACK.insights.slice(0, Math.max(0, 3 - insights.length))]
          : insights;

    const synthetic: FrameMogV2 = {
      photo_type: "unknown",
      overall_score: currentScore,
      potential_score: potentialScore,
      score_breakdown: deriveScoreBreakdown(currentScore),
      insights: trimmed,
      top_1_move: pickTop1Move(o.ai_summary),
    };

    return clampAndSanitizeFrameMogV2(synthetic);
  } catch {
    return clampAndSanitizeFrameMogV2(DEFAULT_FALLBACK);
  }
}
