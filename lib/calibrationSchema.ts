/**
 * Calibration wizard step definitions.
 * 4 steps, single-choice tiles each.
 */

export type CalibrationAnswers = {
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
};

export const CALIBRATION_STEPS = [
  {
    id: "step1",
    key: "step1" as const,
    title: "Primary goal",
    subtitle: "What matters most right now?",
    options: [
      { id: "presence", label: "Presence in group photos" },
      { id: "posture", label: "Posture & stance" },
      { id: "overall", label: "Overall frame dominance" },
    ],
  },
  {
    id: "step2",
    key: "step2" as const,
    title: "Photo context",
    subtitle: "Where will you apply this?",
    options: [
      { id: "social", label: "Social media & dating" },
      { id: "events", label: "Events & parties" },
      { id: "professional", label: "Professional / networking" },
    ],
  },
  {
    id: "step3",
    key: "step3" as const,
    title: "Current focus",
    subtitle: "What do you want to improve first?",
    options: [
      { id: "width", label: "Shoulder width & silhouette" },
      { id: "stance", label: "Stance & positioning" },
      { id: "both", label: "Both equally" },
    ],
  },
  {
    id: "step4",
    key: "step4" as const,
    title: "Feedback style",
    subtitle: "How detailed should results be?",
    options: [
      { id: "concise", label: "Quick & actionable" },
      { id: "detailed", label: "Detailed breakdown" },
      { id: "balanced", label: "Balanced" },
    ],
  },
] as const;
