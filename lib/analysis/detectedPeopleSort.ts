import { getPersonLabel } from "@/lib/analysis/labels";
import type { DetectedPerson } from "@/lib/types/database";

type WithBox = { id: string; box: { x: number; y: number; w: number; h: number }; confidence?: number };

/**
 * Sort by position (centerX ascending, centerY tiebreaker) and assign deterministic labels A, B, C...
 * Same input order of boxes always yields same labels.
 */
export function sortByPositionAndAssignLabels(items: WithBox[]): DetectedPerson[] {
  if (!items?.length) return [];

  const withCenter = items.map((item) => {
    const b = item.box;
    const centerX = b.x + b.w / 2;
    const centerY = b.y + b.h / 2;
    return { ...item, centerX, centerY };
  });

  withCenter.sort((a, b) => {
    const dx = a.centerX - b.centerX;
    if (dx !== 0) return dx;
    return a.centerY - b.centerY;
  });

  return withCenter.map((item, i) => ({
    id: item.id,
    label: getPersonLabel(i),
    box: item.box,
    ...(typeof item.confidence === "number" && { confidence: item.confidence }),
  }));
}
