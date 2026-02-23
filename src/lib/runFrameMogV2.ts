import { openai } from "@/lib/openai/client";
import {
  validateFrameMogV2,
  clampAndSanitizeFrameMogV2,
  DEFAULT_FALLBACK,
  type FrameMogV2,
} from "@/src/lib/frameMogSchema";

/** Fallback when image is corrupted or API fails — low score + photography fixes */
const PHOTOGRAPHY_SAFE_FALLBACK: FrameMogV2 = {
  photo_type: "unknown",
  overall_score: 25,
  potential_score: 50,
  score_breakdown: {
    frame: 25,
    posture: 25,
    presence: 25,
    composition: 25,
    expression: 25,
    style: 25,
  },
  insights: [
    "Image quality limits analysis. Use sharper focus and better lighting.",
    "Retake with the subject clearly visible and well-lit.",
    "Ensure the lens captures a readable face or full-frame subject.",
  ],
  top_1_move: "Retake with clearer focus and good lighting.",
};

const RUN_V2_SYSTEM = `You are a frame-control analyst. Your tone is slightly savage but never insulting — direct, witty, and honest. Advice must be visual and actionable (what to change or do in the next shot).

SAFETY HANDLING:
- NO PERSON DETECTED (no face, full body crop, product shot, landscape): Set overall_score 20–35, potential_score 50–60. Use photo_type "unknown". Insights: 3–5 photography fixes (lighting, composition, focus, framing, lens choice). top_1_move: concrete retake tip.
- MULTIPLE FACES AMBIGUOUS: Analyze the PRIMARY SUBJECT — the person closest to image center. Score that person only.
- IMAGE CORRUPTED (blurry, corrupted, unreadable): Set overall_score 25, potential_score 45. Use photo_type "unknown". Insights: photography tips (sharper focus, better lighting, retake). top_1_move: "Retake with clearer focus and good lighting."

CRITICAL:
- Output ONLY valid JSON. No markdown. No \`\`\`json fences. No commentary.
- Use EXACTLY the keys specified. No extra keys. No identity guesses or assumptions about who the person is.
- Score_breakdown keys must be exactly: frame, posture, presence, composition, expression, style (lowercase).
- Insights: 3–6 short bullets. Each one visual and actionable.
- potential_score must be >= overall_score.
- top_1_move: the single highest-leverage move. Separate from insights. One concrete action.

PHOTO TYPE → METRIC LABELS (what each key means for that context):

shirtless_gym: frame=V-Taper, posture=Shoulder Set, presence=Tension Control, composition=Lighting/Angle, expression=Face Relaxation, style=Grooming (Minimal)

fashion_group: frame=Silhouette, posture=Stance, presence=Aura, composition=Camera Position, expression=Face/Smile, style=Fit + Cohesion

frat_group: frame=Space Claim, posture=Spine Stack, presence=Alpha Signal, composition=Center Control, expression=Nonchalance, style=Uniformity (or Standout)

solo_fit: frame=Proportions, posture=Alignment, presence=Confidence, composition=Framing, expression=Eyes/Jaw, style=Outfit Fit

formal_event: frame=Suit Structure, posture=Tall Stack, presence=Composure, composition=Elegance, expression=Warmth, style=Polish

selfie: frame=Angle Discipline, posture=Neck/Chin, presence=Intent, composition=Crop/Background, expression=Eyes, style=Grooming

unknown: generic labels (frame=Frame, posture=Posture, presence=Presence, composition=Composition, expression=Expression, style=Style)`;

const RUN_V2_USER = `Analyze this photo for frame dominance. Return ONLY this JSON object — no other text, no markdown.

{
  "photo_type": "shirtless_gym" | "fashion_group" | "frat_group" | "solo_fit" | "formal_event" | "selfie" | "unknown",
  "overall_score": 0–100,
  "potential_score": 0–100, must be >= overall_score,
  "score_breakdown": {
    "frame": 0–100,
    "posture": 0–100,
    "presence": 0–100,
    "composition": 0–100,
    "expression": 0–100,
    "style": 0–100
  },
  "insights": ["string", "string", ...],
  "top_1_move": "string"
}

REQUIREMENTS:
- EXACTLY 6 metrics in score_breakdown. Keys must be: frame, posture, presence, composition, expression, style.
- 3–6 insights. Visual, actionable. Slightly savage but not insulting.
- potential_score >= overall_score.
- top_1_move: single highest-leverage move. Separate, concrete.`;

function extractJson(raw: string): string {
  let s = raw.replace(/```json\n?|\n?```/g, "").trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  return s;
}

function parseJsonOrNull(s: string): unknown | null {
  try {
    return JSON.parse(s) as unknown;
  } catch {
    return null;
  }
}

function isValidationFallback(v: FrameMogV2): boolean {
  return (
    v.photo_type === DEFAULT_FALLBACK.photo_type &&
    v.overall_score === DEFAULT_FALLBACK.overall_score &&
    v.insights[0] === DEFAULT_FALLBACK.insights[0]
  );
}

/**
 * Runs FrameMog v2 analysis on an image. Uses OpenAI Vision.
 * One retry if JSON invalid. Validates with validateFrameMogV2.
 * Logs photo_type + scores server-side. Never throws.
 */
export async function runFrameMogV2({
  imageUrl,
}: {
  imageUrl: string;
}): Promise<FrameMogV2> {
  const runVision = async (): Promise<FrameMogV2> => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: RUN_V2_SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: RUN_V2_USER },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 2048,
      });

      const raw = completion.choices[0]?.message?.content?.trim();
      if (!raw) return validateFrameMogV2(null);

      const cleaned = extractJson(raw);
      const parsed = parseJsonOrNull(cleaned);
      const validated = validateFrameMogV2(parsed);
      return validated;
    } catch {
      return validateFrameMogV2(null);
    }
  };

  let result: FrameMogV2;
  try {
    result = await runVision();
  } catch {
    return clampAndSanitizeFrameMogV2(PHOTOGRAPHY_SAFE_FALLBACK);
  }

  if (isValidationFallback(result)) {
    try {
      result = await runVision();
    } catch {
      result = clampAndSanitizeFrameMogV2(PHOTOGRAPHY_SAFE_FALLBACK);
    }
    if (isValidationFallback(result)) {
      result = clampAndSanitizeFrameMogV2(PHOTOGRAPHY_SAFE_FALLBACK);
    }
  }

  const sanitized = clampAndSanitizeFrameMogV2(result);

  try {
    console.log(
      "[runFrameMogV2] photo_type=%s overall=%s potential=%s insight_count=%s",
      sanitized.photo_type,
      sanitized.overall_score,
      sanitized.potential_score,
      sanitized.insights?.length ?? 0
    );
  } catch {
    // ignore log failures
  }

  return sanitized;
}
