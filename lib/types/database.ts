/**
 * FrameMog database types
 * Updated for v2 migration: analysis_version, result_v2
 */

/** One stored detected person (persistent per analysis). */
export type DetectedPerson = {
  id: string;
  label: string;
  box: { x: number; y: number; w: number; h: number };
  confidence?: number;
};

/** Analysis row from `analyses` table */
export type AnalysisRow = {
  id: string;
  created_at: string;
  image_path: string;
  image_width: number | null;
  image_height: number | null;
  status: string;
  consent_confirmed: boolean;
  selected_label: string | null;
  /** Id of selected person in detected_people (overlay flow). */
  selected_person_id: string | null;
  current_score: number | null;
  potential_score: number | null;
  potential_delta: number | null;
  ai_summary: Record<string, unknown> | null;
  error_message: string | null;
  /** v2 migration: analysis pipeline version, default 'v1' */
  analysis_version: "v1" | "v2";
  /** v2 migration: v2 analysis result; null for v1 analyses. Shape TBD. */
  result_v2: ResultV2 | null;
  /** Dominance ranking v2 result; null if not run */
  dominance_result_v2: DominanceResultV2 | null;
  /** Dominance ranking version: v1 (from run) or v2 (from runDominanceRanking) */
  dominance_version: "v1" | "v2";
  /** Stored detection result; when set, detection is not re-run. Null for older analyses. */
  detected_people: DetectedPerson[] | null;
  /** Calibration wizard answers (step1..step4) tied to analysis. */
  calibration_data: Record<string, unknown> | null;
};

/** Dominance ranking v2 schema */
export type DominanceResultV2 = Record<string, unknown>;

/** v2 analysis result schema - extend when v2 output is defined */
export type ResultV2 = Record<string, unknown>;

/** Insert payload for `analyses` (omit auto-generated fields) */
export type AnalysisInsert = Omit<
  AnalysisRow,
  "id" | "created_at" | "analysis_version" | "result_v2" | "dominance_result_v2" | "dominance_version" | "detected_people"
> & {
  id?: string;
  created_at?: string;
  analysis_version?: "v1" | "v2";
  result_v2?: ResultV2 | null;
  dominance_result_v2?: DominanceResultV2 | null;
  dominance_version?: "v1" | "v2";
  detected_people?: DetectedPerson[] | null;
};
