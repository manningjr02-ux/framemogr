/**
 * Calibration engine types.
 * Single-choice questions only.
 */

export type CalibrationChoice = {
  id: string;
  label: string;
};

export type CalibrationQuestion = {
  id: string;
  label?: string;
  choices: CalibrationChoice[];
  single: true;
};

export type CalibrationStep = {
  id: string;
  title: string;
  subtitle: string;
  questions: CalibrationQuestion[];
};

export type CalibrationQuestionWithCategory = CalibrationQuestion & {
  category: string;
};

export type CalibrationAnswers = Record<string, string>;

export type CalibrationPayload = {
  version: string;
  analysisId: string;
  selectedLabel: string;
  answers: CalibrationAnswers;
};
