/**
 * Calibration engine step definitions.
 * 4 steps, 14 questions total. Single-choice only.
 */

import type { CalibrationStep, CalibrationQuestionWithCategory } from "./types";

export const CALIBRATION_VERSION = "cal_v1";

export const CALIBRATION_STEPS: CalibrationStep[] = [
  {
    id: "context",
    title: "Context mapping",
    subtitle: "Environmental variables influence dominance read.",
    questions: [
      {
        id: "photo_setting",
        choices: [
          { id: "gym", label: "Gym" },
          { id: "party", label: "Party" },
          { id: "friends", label: "Friends" },
          { id: "formal", label: "Formal" },
          { id: "other", label: "Other" },
        ],
        single: true,
      },
      {
        id: "posed_level",
        choices: [
          { id: "fully_posed", label: "Fully posed" },
          { id: "semi_posed", label: "Semi-posed" },
          { id: "candid", label: "Candid" },
        ],
        single: true,
      },
      {
        id: "camera_distance",
        choices: [
          { id: "close", label: "Close" },
          { id: "medium", label: "Medium" },
          { id: "far", label: "Far" },
        ],
        single: true,
      },
    ],
  },
  {
    id: "intent",
    title: "Camera + posture intent",
    subtitle: "We adjust for awareness + posture intent.",
    questions: [
      {
        id: "camera_awareness",
        choices: [
          { id: "yes", label: "Yes" },
          { id: "somewhat", label: "Somewhat" },
          { id: "no", label: "No" },
        ],
        single: true,
      },
      {
        id: "posture_state",
        choices: [
          { id: "tall", label: "Tall" },
          { id: "neutral", label: "Neutral" },
          { id: "relaxed", label: "Relaxed" },
        ],
        single: true,
      },
      {
        id: "camera_angle_intent",
        choices: [
          { id: "yes", label: "Yes" },
          { id: "slightly", label: "Slightly" },
          { id: "no", label: "No" },
        ],
        single: true,
      },
      {
        id: "trying_to_look_good",
        choices: [
          { id: "trying", label: "Trying" },
          { id: "normal", label: "Normal" },
          { id: "unplanned", label: "Unplanned" },
        ],
        single: true,
      },
      {
        id: "centered_in_frame",
        choices: [
          { id: "center", label: "Center" },
          { id: "off_center", label: "Off-center" },
          { id: "edge", label: "Edge" },
        ],
        single: true,
      },
    ],
  },
  {
    id: "signals",
    title: "Visual signals",
    subtitle: "Lighting and preparation affect facial signal clarity.",
    questions: [
      {
        id: "lighting_face",
        choices: [
          { id: "yes", label: "Yes" },
          { id: "neutral", label: "Neutral" },
          { id: "no", label: "No" },
        ],
        single: true,
      },
      {
        id: "grooming",
        choices: [
          { id: "yes", label: "Yes" },
          { id: "normal", label: "Normal" },
          { id: "no", label: "No" },
        ],
        single: true,
      },
      {
        id: "tired_stressed",
        choices: [
          { id: "no", label: "No" },
          { id: "slightly", label: "Slightly" },
          { id: "yes", label: "Yes" },
        ],
        single: true,
      },
    ],
  },
  {
    id: "alignment",
    title: "Perception alignment",
    subtitle: "We compare predicted vs measured dominance.",
    questions: [
      {
        id: "predicted_rank_bucket",
        choices: [
          { id: "top", label: "Top" },
          { id: "middle", label: "Middle" },
          { id: "lower", label: "Lower" },
          { id: "not_sure", label: "Not sure" },
        ],
        single: true,
      },
      {
        id: "primary_goal",
        choices: [
          { id: "look_better", label: "Look better in future photos" },
          { id: "fix_leak", label: "Fix biggest leak" },
          { id: "see_rank", label: "Just see rank" },
        ],
        single: true,
      },
      {
        id: "share_intent",
        choices: [
          { id: "yes", label: "Yes" },
          { id: "maybe", label: "Maybe" },
          { id: "no", label: "No" },
        ],
        single: true,
      },
    ],
  },
];

export const ALL_QUESTIONS: CalibrationQuestionWithCategory[] =
  CALIBRATION_STEPS.flatMap((step) =>
    step.questions.map((q) => ({ ...q, category: step.id }))
  );
