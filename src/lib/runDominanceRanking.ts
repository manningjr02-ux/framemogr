import { openai } from "@/lib/openai/client";
import {
  validateDominanceResult,
  clampAndSanitizeDominanceResult,
  DEFAULT_FALLBACK,
  type DominanceResult,
} from "@/src/lib/dominanceSchema";

const SYSTEM_PROMPT = `You are a dominance scoring engine for a GROUP photo.

Score each labeled person relative to others in the SAME frame.

Output strict JSON only. No markdown. No extra keys.

Consider: camera depth, center control, posture, shoulder line, expression, styling coherence, space claiming.

Do not guess identity. Do not mention protected attributes.

Return scores 0–100 with natural variance (avoid all 0s, avoid ties).`;

function getUserPrompt(labels: string[], userLabel?: string | null): string {
  const labelsJson = JSON.stringify(labels);
  return `Analyze this group photo. Score each person for frame dominance.

LABELS (in order): ${labelsJson}
${userLabel ? `USER SELECTED THEMSELVES AS: ${userLabel}` : ""}

Return ONLY this JSON object — no other text, no markdown:
{
  "people": [{"label": "Person A", "dominance_score": 0}, ...],
  "user_label": "${userLabel ?? ""}",
  "user_rank": 0,
  "total_people": 0
}

Requirements:
- Include every label from the list exactly once.
- dominance_score: 0–100 per person, with natural variance (no ties, no all 0s).
- user_label: the selected person's label, or null if none.
- user_rank: 1-based rank of user_label (1 = highest score), or null.
- total_people: number of people in the array.`;
}

function getUserPromptWithRetryHint(labels: string[], userLabel?: string | null): string {
  return (
    getUserPrompt(labels, userLabel) +
    "\n\nIMPORTANT: Fix to valid JSON matching the schema. Ensure people array has all labels exactly once, dominance_score 0–100 per person, unique labels."
  );
}

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

function matchesLabels(result: DominanceResult, labels: string[]): boolean {
  if (result.people.length !== labels.length) return false;
  const resultLabels = new Set(result.people.map((p) => p.label.trim()));
  return labels.every((l) => resultLabels.has(l.trim()));
}

function computeUserRank(
  people: { label: string; dominance_score: number }[],
  userLabel: string | null | undefined
): number | null {
  if (!userLabel || !userLabel.trim()) return null;
  const sorted = [...people].sort((a, b) => b.dominance_score - a.dominance_score);
  const idx = sorted.findIndex(
    (p) => p.label.trim().toLowerCase() === userLabel.trim().toLowerCase()
  );
  return idx >= 0 ? idx + 1 : null;
}

function isFallbackResult(result: DominanceResult): boolean {
  return (
    result.people.length === DEFAULT_FALLBACK.people.length &&
    result.people.every(
      (p, i) => p.label === DEFAULT_FALLBACK.people[i]?.label
    )
  );
}

/**
 * Runs dominance ranking analysis on a group photo.
 * Uses OpenAI Vision. Retries once if invalid. Returns sanitized DominanceResult.
 */
export async function runDominanceRanking({
  imageUrl,
  labels,
  userLabel,
}: {
  imageUrl: string;
  labels: string[];
  userLabel?: string | null;
}): Promise<DominanceResult> {
  const runVision = async (retryFix = false): Promise<DominanceResult> => {
    try {
      const userContent = retryFix
        ? getUserPromptWithRetryHint(labels, userLabel)
        : getUserPrompt(labels, userLabel);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userContent },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 1024,
      });

      const raw = completion.choices[0]?.message?.content?.trim();
      if (!raw) return validateDominanceResult(null);

      const cleaned = extractJson(raw);
      const parsed = parseJsonOrNull(cleaned);
      const validated = validateDominanceResult(parsed);

      if (!matchesLabels(validated, labels) || isFallbackResult(validated)) {
        return validated;
      }

      let user_rank = validated.user_rank;
      if (user_rank == null && validated.user_label) {
        user_rank = computeUserRank(validated.people, validated.user_label);
      }

      return {
        ...validated,
        user_rank: user_rank ?? validated.user_rank,
      };
    } catch {
      return validateDominanceResult(null);
    }
  };

  let result = await runVision(false);

  if (!matchesLabels(result, labels) || isFallbackResult(result)) {
    result = await runVision(true);
  }

  const sanitized = clampAndSanitizeDominanceResult(result);

  let user_rank = sanitized.user_rank;
  if (user_rank == null && (sanitized.user_label || userLabel)) {
    user_rank = computeUserRank(sanitized.people, sanitized.user_label ?? userLabel);
  }

  return {
    ...sanitized,
    user_label: sanitized.user_label ?? userLabel ?? null,
    user_rank,
  };
}
