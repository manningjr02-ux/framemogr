export const RUN_SYSTEM = `You are an expert at analyzing group photos for "frame control" — who dominates the visual hierarchy. Return ONLY valid JSON. No markdown. No commentary. Use ONLY the allowed enum values. Do NOT invent new leak or strength types.`;

export const FRAME_LEAK_ENUMS = [
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

export const STRENGTH_ENUMS = [
  "PROXIMITY_ADVANTAGE",
  "STRUCTURE_FROM_FIT",
  "STRONG_CHIN_LINE",
  "GOOD_LIGHT_CAPTURE",
  "SHOULDER_WIDTH_PRESENCE",
  "CONFIDENT_EXPRESSION",
  "COLOR_SEPARATION_WIN",
] as const;

export const STRENGTH_WEAKNESS_ENUMS = [
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

export function getRunUser(selectedLabel: string, labels: string[]): string {
  return `Analyze this group photo. Score each visible person on frame dominance.

DETECTED LABELS (MUST USE EXACTLY THESE, ONCE EACH):
${labels.join(", ")}

User selected themselves as: ${selectedLabel}

HARD REQUIREMENTS:
- Output MUST include every label listed above exactly once.
- Do NOT invent any new labels.
- Do NOT omit any label.
- dominance_score: integer 30–95 (realistic distribution).
- breakdown: each integer 1–100 with keys exactly:
  frame_authority, fit_precision, grooming_timing, camera_positioning, posture_control, aura_expression
- strengths/weaknesses: arrays of enums ONLY from the allowed list.
- current_score must equal ${selectedLabel}'s dominance_score.
- potential_score must be 1–20 points higher than current_score (realistic).
- global_signals: 0–3 enums from allowed list.
- Return ONLY valid JSON. No markdown fences. No extra keys.

FRAME LEAK TEMPLATE LIBRARY (use ONLY these for frame_leaks.type):
LENS_PROXIMITY_IMBALANCE, SHOULDER_CLOSURE, CHIN_POSITIONING, BODY_ORIENTATION_FLAT, HEIGHT_STACKING_LOSS, LIGHTING_MISALIGNMENT, COLOR_CONTRAST_MISS, HAND_PLACEMENT_WEAK, EXPRESSION_NEUTRAL_DRAIN, CROPPING_RISK, HAIR_TIMING_DROP, POSTURE_COLLAPSE

STRENGTH TYPE ENUM (use ONLY these for doing_right.type):
PROXIMITY_ADVANTAGE, STRUCTURE_FROM_FIT, STRONG_CHIN_LINE, GOOD_LIGHT_CAPTURE, SHOULDER_WIDTH_PRESENCE, CONFIDENT_EXPRESSION, COLOR_SEPARATION_WIN

You MUST choose frame_leaks.type from the FRAME LEAK TEMPLATE LIBRARY.
You MUST choose doing_right.type from the STRENGTH TYPE ENUM.
Do NOT invent new leak types or strength types.
All advice must be group-photo specific and tactical.

frame_leaks: 3–5 items. fix: 1–2 sentence instruction, max 26 words, actionable in 5–10 seconds. impact: HIGH|MEDIUM|LOW. points: 1–10.
doing_right: 2–4 items. amplify: instruction to double down, max 26 words. impact: HIGH|MEDIUM|LOW. points: 1–10.
photo_context: 2–4 short bullets. Environmental factors (lighting, lens distortion, stacking, background dominance).

Return this exact JSON structure:
{
  "people": [
    {
      "label": "Person A",
      "dominance_score": 72,
      "breakdown": {
        "frame_authority": 70,
        "fit_precision": 75,
        "grooming_timing": 68,
        "camera_positioning": 80,
        "posture_control": 65,
        "aura_expression": 72
      },
      "strengths": ["CAMERA_DISTANCE", "SHIRT_FIT"],
      "weaknesses": ["POSTURE_OPENNESS"]
    }
  ],
  "current_score": 72,
  "potential_score": 85,
  "global_signals": ["LIGHTING_POSITION", "LENS_ALIGNMENT"],
  "photo_context": ["Lighting favors center. Lens distortion at edges."],
  "frame_leaks": [
    {
      "type": "LENS_PROXIMITY_IMBALANCE",
      "fix": "Step 8–12% closer to the lens for instant presence gain.",
      "impact": "HIGH",
      "points": 7
    }
  ],
  "doing_right": [
    {
      "type": "PROXIMITY_ADVANTAGE",
      "amplify": "You're closer to the lens. Hold that position in the next shot.",
      "impact": "MEDIUM",
      "points": 5
    }
  ]
}`;
}

