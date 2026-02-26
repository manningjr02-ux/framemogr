import { z } from "zod";

const unitInterval = z.number().min(0).max(1);

/** Box with all values in [0, 1]. */
export const detectBoxSchema = z.object({
  x: unitInterval,
  y: unitInterval,
  w: unitInterval,
  h: unitInterval,
});

export const detectedPersonSchema = z.object({
  id: z.string(),
  label: z.string(),
  box: detectBoxSchema,
  confidence: z.number().optional(),
});

/** Validated shape of GET detect API success response. */
export const detectResponseSchema = z.object({
  imageUrl: z.string(),
  people: z.array(detectedPersonSchema),
});

export type DetectResponse = z.infer<typeof detectResponseSchema>;

/** Validate and return parsed data or null. */
export function parseDetectResponse(data: unknown): DetectResponse | null {
  const result = detectResponseSchema.safeParse(data);
  return result.success ? result.data : null;
}

/** Format Zod issues for structured error. */
export function formatDetectValidationError(result: {
  error: z.ZodError;
}): { error: string; details: z.ZodIssue[] } {
  return {
    error: "Validation failed",
    details: result.error.issues,
  };
}
