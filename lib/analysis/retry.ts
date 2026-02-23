import { parseRunResponseSafe, type RunResponse } from "./validate";

export async function parseWithRetry<T>(
  fn: () => Promise<string>,
  parse: (raw: string) => T,
  maxAttempts = 2
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const raw = await fn();
      const parsed = parse(raw);
      return parsed;
    } catch (e) {
      lastError = e;
      if (attempt === maxAttempts) break;
    }
  }
  throw lastError;
}

export function parseRunResponse(raw: string): RunResponse {
  return parseRunResponseSafe(raw);
}
