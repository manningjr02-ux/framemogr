/**
 * Dominance ranking schema: types, validation, and sanitization.
 * Never throws — always returns a valid DominanceResult or safe fallback.
 */

/** Simple stable hash of a string, returns 0–1 fraction. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h) / 2147483647;
}

/**
 * Generates deterministic non-zero dominance scores from (analysisId + label).
 * Scores in 40–80 range. Sorted desc for ranking. Use when OpenAI fails.
 */
export function generateFallbackDominance(
  analysisId: string,
  labels: string[]
): DominanceResult {
  const people: DominancePerson[] = labels.map((label) => {
    const raw = hashString(analysisId + label);
    const score = 40 + Math.floor(raw * 41);
    return { label, dominance_score: Math.max(40, Math.min(80, score)) };
  });
  const sorted = [...people].sort((a, b) => b.dominance_score - a.dominance_score);
  return {
    people: sorted,
    user_label: null,
    user_rank: null,
    total_people: sorted.length,
  };
}

export type DominancePerson = {
  label: string;
  dominance_score: number;
};

export type DominanceResult = {
  people: DominancePerson[];
  user_label?: string | null;
  user_rank?: number | null;
  total_people: number;
};

/** Safe fallback with non-zero spread (62, 59, 57, ...) */
const DEFAULT_PEOPLE: DominancePerson[] = [
  { label: "Person A", dominance_score: 62 },
  { label: "Person B", dominance_score: 59 },
  { label: "Person C", dominance_score: 57 },
  { label: "Person D", dominance_score: 54 },
  { label: "Person E", dominance_score: 51 },
];

export const DEFAULT_FALLBACK: DominanceResult = {
  people: [...DEFAULT_PEOPLE],
  user_label: null,
  user_rank: null,
  total_people: DEFAULT_PEOPLE.length,
};

function clampScore(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Deterministic spread when all scores are identical. Index → small delta. */
function spreadIdenticalScores(people: DominancePerson[]): DominancePerson[] {
  if (people.length === 0) return people;
  const scores = people.map((p) => clampScore(p.dominance_score));
  const allSame = scores.every((s) => s === scores[0]);
  if (!allSame) return people;

  const base = clampScore(scores[0] ?? 50);
  const rawDelta = Math.floor((100 - base) / Math.max(1, people.length));
  const delta = Math.max(1, Math.min(4, rawDelta || 1));
  return people.map((p, i) => ({
    label: p.label,
    dominance_score: Math.max(0, Math.min(100, base - i * delta)),
  }));
}

function hasUniqueLabels(people: DominancePerson[]): boolean {
  const labels = new Set<string>();
  for (const p of people) {
    const L = typeof p.label === "string" ? p.label.trim() : "";
    if (!L || labels.has(L)) return false;
    labels.add(L);
  }
  return true;
}

function isValidPerson(p: unknown): p is DominancePerson {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  if (typeof o.label !== "string" || !o.label.trim()) return false;
  const score = o.dominance_score;
  if (typeof score !== "number" || Number.isNaN(score)) return false;
  return true;
}

/**
 * Validates unknown input as DominanceResult. Never throws.
 * Returns the input (as DominanceResult) if valid, otherwise DEFAULT_FALLBACK.
 */
export function validateDominanceResult(input: unknown): DominanceResult {
  try {
    if (!input || typeof input !== "object") return DEFAULT_FALLBACK;
    const o = input as Record<string, unknown>;

    const peopleRaw = o.people;
    if (!Array.isArray(peopleRaw) || peopleRaw.length < 2) return DEFAULT_FALLBACK;

    const people: DominancePerson[] = [];
    for (const item of peopleRaw) {
      if (!isValidPerson(item)) return DEFAULT_FALLBACK;
      people.push({
        label: (item.label as string).trim(),
        dominance_score: clampScore(item.dominance_score),
      });
    }

    if (!hasUniqueLabels(people)) return DEFAULT_FALLBACK;

    const total_people = people.length;
    const user_label = o.user_label;
    const user_rankRaw = o.user_rank;
    const user_rank =
      user_rankRaw != null && typeof user_rankRaw === "number" && !Number.isNaN(user_rankRaw)
        ? Math.max(1, Math.min(total_people, Math.round(user_rankRaw)))
        : null;

    return {
      people,
      user_label:
        user_label != null && typeof user_label === "string"
          ? user_label.trim() || null
          : null,
      user_rank,
      total_people,
    };
  } catch {
    return DEFAULT_FALLBACK;
  }
}

/**
 * Clamps and sanitizes a DominanceResult. Never throws.
 * - dominance_score 0–100
 * - Spreads identical scores deterministically
 */
export function clampAndSanitizeDominanceResult(
  input: DominanceResult | unknown
): DominanceResult {
  try {
    const v = validateDominanceResult(input);
    const spread = spreadIdenticalScores(v.people);
    return {
      people: spread,
      user_label: v.user_label ?? null,
      user_rank: v.user_rank ?? null,
      total_people: spread.length,
    };
  } catch {
    return DEFAULT_FALLBACK;
  }
}
