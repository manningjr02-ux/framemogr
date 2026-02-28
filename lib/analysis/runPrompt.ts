// ✅ Drop-in improved prompt set for more accurate scoring + painkiller insights.
// Key upgrades:
// - dominance_score MUST be derived from the 6-metric breakdown (weighted formula).
// - Photo-type–aware rubric (gym/formal/friends/nightclub/selfie/etc) WITHOUT changing JSON schema.
// - Strong consistency constraints: rankings, strengths/weaknesses must match metric highs/lows.
// - Frame leaks fixes are immediate (5–10s) and tied to lowest metrics.
// - Conservative scoring when uncertain (prevents inflated breakdown vs low overall).

export const RUN_SYSTEM = `
You are an expert at analyzing group photos for "frame control" — who dominates the visual hierarchy in THIS image.
Return ONLY valid JSON. No markdown. No commentary. No extra keys.
Use ONLY the allowed enum values. Do NOT invent new leak or strength types.
Be evidence-based: score ONLY what is visible in the photo. If unclear, score conservatively (65–75).
`;

// (Keep your enums unchanged)
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
  return `
Analyze this group photo. Score each visible person on frame dominance in THIS image.

DETECTED LABELS (MUST USE EXACTLY THESE, ONCE EACH):
${labels.join(", ")}

User selected themselves as: ${selectedLabel}

========================
PHOTO-TYPE AWARE RUBRIC (NO SCHEMA CHANGE)
========================
First, silently classify the photo type (do NOT add new JSON keys):
- gym/selfie/mirror
- formal event
- friends group indoor/outdoor
- nightclub/low-light
- professional/headshot
- street candid/travel

Then apply a type-aware interpretation of the SAME 6 metrics.
Examples:
- Gym/mirror: posture + camera positioning + frame authority matter most.
- Formal: fit precision + grooming timing + camera positioning matter more.
- Low-light: camera positioning + aura expression + grooming timing matter more.
You MUST still output the same keys and same schema.

========================
HARD REQUIREMENTS (STRICT)
========================
1) Output MUST include every label listed above exactly once in people[].
   - Do NOT invent labels.
   - Do NOT omit labels.

2) breakdown must include integers 1–100 with keys EXACTLY:
   frame_authority, fit_precision, grooming_timing, camera_positioning, posture_control, aura_expression

3) dominance_score MUST be computed from breakdown using this exact weighted formula:
   dominance_score = round(
     frame_authority*0.20 +
     fit_precision*0.15 +
     grooming_timing*0.10 +
     camera_positioning*0.25 +
     posture_control*0.20 +
     aura_expression*0.10
   )

   - dominance_score must be an integer 30–95.
   - If you output a dominance_score that does NOT match this formula, you FAILED.
   - Keep breakdown realistic: if a person’s dominance_score is ~70, their breakdown should not be mostly 80s.

4) Ranking consistency:
   - people should be realistically distributed.
   - If Person X has a higher dominance_score than Person Y, their overall “feel” should match (don’t give Y all higher metrics).

5) strengths/weaknesses (per person):
   - strengths: 1–3 enums from allowed list
   - weaknesses: 1–3 enums from allowed list
   - They MUST align with breakdown:
     - strengths must map to the person’s TOP 1–2 metrics
     - weaknesses must map to the person’s BOTTOM 1–2 metrics

6) current_score must equal ${selectedLabel}'s dominance_score.

7) potential_score must be 6–18 points higher than current_score (realistic, clamp to <=95).
   - potential_score should be achievable via quick fixes (not genetics, not long-term changes).
   - potential_score should NOT exceed what the scenario allows (e.g., if lens disadvantage is extreme, don’t claim +20).

8) photo_context: 2–4 short bullets, environmental + composition factors ONLY.
   - Include at least 1 bullet about lens / distance / camera height if relevant.
   - Include at least 1 bullet about lighting or stacking if relevant.
   - Keep each bullet <= 12 words.

9) frame_leaks (for the SELECTED USER ONLY): 3–5 items
   - type: ONLY from FRAME LEAK TEMPLATE LIBRARY
   - fix: 1–2 sentences, max 22 words, action doable in 5–10 seconds NEXT photo
   - impact: HIGH|MEDIUM|LOW
   - points: 2–8 (realistic). Total suggested points should roughly explain the gap to potential_score.
   - Every fix must explicitly tie to one of the 6 metrics (implicitly via the leak type), and be “painkiller”:
     ✅ camera height, step distance, where to stand, chin/shoulders/lats cue, torso angle, expression cue
     ❌ no months-long advice (fat loss plans, skincare routines, surgery, “confidence building”)

10) doing_right (for the SELECTED USER ONLY): 2–4 items
   - type: ONLY from STRENGTH TYPE ENUM
   - amplify: <= 22 words, tactical, repeatable in next photo
   - impact: HIGH|MEDIUM|LOW
   - points: 1–6

11) global_signals: 0–3 enums from STRENGTH_WEAKNESS_ENUMS that describe the overall scene.

========================
FRAME LEAK TEMPLATE LIBRARY (use ONLY these for frame_leaks.type)
========================
LENS_PROXIMITY_IMBALANCE, SHOULDER_CLOSURE, CHIN_POSITIONING, BODY_ORIENTATION_FLAT, HEIGHT_STACKING_LOSS, LIGHTING_MISALIGNMENT, COLOR_CONTRAST_MISS, HAND_PLACEMENT_WEAK, EXPRESSION_NEUTRAL_DRAIN, CROPPING_RISK, HAIR_TIMING_DROP, POSTURE_COLLAPSE

STRENGTH TYPE ENUM (use ONLY these for doing_right.type)
PROXIMITY_ADVANTAGE, STRUCTURE_FROM_FIT, STRONG_CHIN_LINE, GOOD_LIGHT_CAPTURE, SHOULDER_WIDTH_PRESENCE, CONFIDENT_EXPRESSION, COLOR_SEPARATION_WIN

========================
IMPORTANT ANTI-HALLUCINATION RULE
========================
Do NOT invent specifics you cannot see.
If the lighting/angle/hair/facial hair detail is unclear, score it 65–75 and avoid claiming precision.

========================
RETURN THIS EXACT JSON STRUCTURE (NO EXTRA KEYS)
========================
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
  "photo_context": ["Lighting favors center faces.", "Wide lens penalizes closest person."],
  "frame_leaks": [
    {
      "type": "LENS_PROXIMITY_IMBALANCE",
      "fix": "Take one step back so you’re not closest to the lens. Let someone else be front-most.",
      "impact": "HIGH",
      "points": 7
    }
  ],
  "doing_right": [
    {
      "type": "PROXIMITY_ADVANTAGE",
      "amplify": "Stay near center of the frame where distortion is lowest.",
      "impact": "MEDIUM",
      "points": 4
    }
  ]
}
`;
}
