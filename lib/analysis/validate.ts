import { z } from "zod";

const FRAME_LEAK_ENUMS = [
  "LENS_PROXIMITY_IMBALANCE",
  "SHOULDER_CLOSURE",
  "CHIN_POSITIONING",
  "BODY_ORIENTATION_FLAT",
  "HEIGHT_STACKING_LOSS",
  "LIGHTING_MISALIGNMENT",
  "COLOR_CONTRAST_MISS",
  "HAND_PLACEMENT_WEAK",
  "EXPRESSION_NEUTRAL_DRAIN",
  "CROPPING_RISK",
  "HAIR_TIMING_DROP",
  "POSTURE_COLLAPSE",
] as const;

const STRENGTH_ENUMS = [
  "PROXIMITY_ADVANTAGE",
  "STRUCTURE_FROM_FIT",
  "STRONG_CHIN_LINE",
  "GOOD_LIGHT_CAPTURE",
  "SHOULDER_WIDTH_PRESENCE",
  "CONFIDENT_EXPRESSION",
  "COLOR_SEPARATION_WIN",
] as const;

const ENUMS = [
  "CAMERA_DISTANCE",
  "SHOULDER_PRESENCE",
  "POSTURE_OPENNESS",
  "SHIRT_FIT",
  "COLOR_CONTRAST",
  "HAIRCUT_SHARPNESS",
  "FACIAL_HAIR_EDGE",
  "SKIN_CLARITY",
  "LIGHTING_POSITION",
  "HEAD_ANGLE",
  "EXPRESSION_CONFIDENCE",
  "JEWELRY_ACCENT",
  "HEIGHT_ILLUSION",
  "LENS_ALIGNMENT",
  "BODY_ORIENTATION",
] as const;

const breakdownSchema = z.object({
  frame_authority: z.number().int().min(1).max(100),
  fit_precision: z.number().int().min(1).max(100),
  grooming_timing: z.number().int().min(1).max(100),
  camera_positioning: z.number().int().min(1).max(100),
  posture_control: z.number().int().min(1).max(100),
  aura_expression: z.number().int().min(1).max(100),
});

const personSchema = z.object({
  label: z.string(),
  dominance_score: z.number().int().min(30).max(95),
  breakdown: breakdownSchema,
  strengths: z.array(z.enum(ENUMS)),
  weaknesses: z.array(z.enum(ENUMS)),
});

const frameLeakSchema = z.object({
  type: z.enum(FRAME_LEAK_ENUMS),
  fix: z.string(),
  impact: z.enum(["HIGH", "MEDIUM", "LOW"]),
  points: z.number().int().min(1).max(10),
});

const doingRightSchema = z.object({
  type: z.enum(STRENGTH_ENUMS),
  amplify: z.string(),
  impact: z.enum(["HIGH", "MEDIUM", "LOW"]),
  points: z.number().int().min(1).max(10),
});

export const runResponseSchema = z
  .object({
    people: z.array(personSchema),
    current_score: z.number().int().min(1).max(100),
    potential_score: z.number().int().min(1).max(100),
    global_signals: z.array(z.enum(ENUMS)),
    photo_context: z.array(z.string()).optional(),
    frame_leaks: z.array(frameLeakSchema).optional(),
    doing_right: z.array(doingRightSchema).optional(),
  })
  .transform((data) => ({
    ...data,
    photo_context: data.photo_context ?? [],
    frame_leaks: data.frame_leaks ?? [],
    doing_right: data.doing_right ?? [],
  }));

export type RunResponse = z.infer<typeof runResponseSchema>;

/** Coerces a number to 1-100 range */
const clamp1_100 = (n: number) => Math.max(1, Math.min(100, Math.round(n)));

/** Relaxed breakdown - tolerates out-of-range values */
const relaxedBreakdownSchema = z
  .object({
    frame_authority: z.number(),
    fit_precision: z.number(),
    grooming_timing: z.number(),
    camera_positioning: z.number(),
    posture_control: z.number(),
    aura_expression: z.number(),
  })
  .transform((b) => ({
    frame_authority: clamp1_100(b.frame_authority),
    fit_precision: clamp1_100(b.fit_precision),
    grooming_timing: clamp1_100(b.grooming_timing),
    camera_positioning: clamp1_100(b.camera_positioning),
    posture_control: clamp1_100(b.posture_control),
    aura_expression: clamp1_100(b.aura_expression),
  }));

/** Relaxed person - accepts any strings for strengths/weaknesses, filters to valid enums */
const relaxedPersonSchema = z
  .object({
    label: z.string(),
    dominance_score: z.number(),
    breakdown: relaxedBreakdownSchema,
    strengths: z.union([z.array(z.string()), z.undefined()]).default([]),
    weaknesses: z.union([z.array(z.string()), z.undefined()]).default([]),
  })
  .transform((p) => ({
    ...p,
    dominance_score: Math.min(95, Math.max(30, Math.round(p.dominance_score))),
    strengths: (p.strengths ?? []).filter((s) =>
      (ENUMS as readonly string[]).includes(s)
    ) as (typeof ENUMS)[number][],
    weaknesses: (p.weaknesses ?? []).filter((w) =>
      (ENUMS as readonly string[]).includes(w)
    ) as (typeof ENUMS)[number][],
  }));

/** Minimal schema for fallback when full schema fails - ensures analysis always completes */
const minimalRunResponseSchema = z.object({
  people: z.array(relaxedPersonSchema),
  current_score: z.number().min(1).max(100),
  potential_score: z.number().min(1).max(100),
  global_signals: z.union([z.array(z.string()), z.undefined()]).default([]),
});

export function parseRunResponseSafe(raw: string): RunResponse {
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
  }

  const full = runResponseSchema.safeParse(parsed);
  if (full.success) return full.data;

  const minimal = minimalRunResponseSchema.safeParse(parsed);
  if (minimal.success) {
    const data = minimal.data;
    return {
      people: data.people,
      current_score: Math.round(data.current_score),
      potential_score: Math.round(data.potential_score),
      global_signals: Array.isArray(data.global_signals)
        ? (data.global_signals.filter((s) =>
            (ENUMS as readonly string[]).includes(s)
          ) as RunResponse["global_signals"])
        : [],
      photo_context: [],
      frame_leaks: [],
      doing_right: [],
    };
  }

  console.error("[parseRunResponseSafe] full error:", full.error?.format());
  console.error("[parseRunResponseSafe] minimal error:", minimal.error?.format());
  throw new Error(
    `Schema validation failed: ${full.error?.message ?? minimal.error?.message}`
  );
}
