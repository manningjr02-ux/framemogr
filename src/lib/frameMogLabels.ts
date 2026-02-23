/**
 * Display labels for score_breakdown keys per photo_type.
 */

import type { ScoreBreakdownKey } from "@/src/lib/frameMogSchema";

const LABELS: Record<string, Record<ScoreBreakdownKey, string>> = {
  shirtless_gym: {
    frame: "V-Taper",
    posture: "Shoulder Set",
    presence: "Tension Control",
    composition: "Lighting/Angle",
    expression: "Face Relaxation",
    style: "Grooming (Minimal)",
  },
  fashion_group: {
    frame: "Silhouette",
    posture: "Stance",
    presence: "Aura",
    composition: "Camera Position",
    expression: "Face/Smile",
    style: "Fit + Cohesion",
  },
  frat_group: {
    frame: "Space Claim",
    posture: "Spine Stack",
    presence: "Alpha Signal",
    composition: "Center Control",
    expression: "Nonchalance",
    style: "Uniformity (or Standout)",
  },
  solo_fit: {
    frame: "Proportions",
    posture: "Alignment",
    presence: "Confidence",
    composition: "Framing",
    expression: "Eyes/Jaw",
    style: "Outfit Fit",
  },
  formal_event: {
    frame: "Suit Structure",
    posture: "Tall Stack",
    presence: "Composure",
    composition: "Elegance",
    expression: "Warmth",
    style: "Polish",
  },
  selfie: {
    frame: "Angle Discipline",
    posture: "Neck/Chin",
    presence: "Intent",
    composition: "Crop/Background",
    expression: "Eyes",
    style: "Grooming",
  },
  unknown: {
    frame: "Frame",
    posture: "Posture",
    presence: "Presence",
    composition: "Composition",
    expression: "Expression",
    style: "Style",
  },
};

const DEFAULT_LABELS = LABELS.unknown;

export function getMetricLabel(photoType: string, key: ScoreBreakdownKey): string {
  const map = LABELS[photoType] ?? DEFAULT_LABELS;
  return map[key] ?? key;
}
