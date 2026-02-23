/**
 * Generate Person A, Person B, ..., Person Z, Person AA, Person AB, ...
 * Supports unlimited indices (0, 1, 2, ...).
 */
export function getPersonLabel(index: number): string {
  let s = "";
  let n = index;
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return `Person ${s}`;
}

/** Sanitize label for storage path: "Person A" -> "Person_A" */
export function labelToPath(label: string): string {
  return label.replace(/\s+/g, "_");
}
