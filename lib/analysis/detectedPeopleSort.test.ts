import { describe, expect, it } from "vitest";
import { sortByPositionAndAssignLabels } from "./detectedPeopleSort";

describe("sortByPositionAndAssignLabels", () => {
  it("returns empty array for empty input", () => {
    expect(sortByPositionAndAssignLabels([])).toEqual([]);
  });

  it("sorts by centerX ascending then centerY as tiebreaker", () => {
    const items = [
      { id: "1", box: { x: 0.5, y: 0.5, w: 0.2, h: 0.2 } },
      { id: "2", box: { x: 0.1, y: 0.1, w: 0.2, h: 0.2 } },
      { id: "3", box: { x: 0.1, y: 0.3, w: 0.2, h: 0.2 } },
    ];
    const result = sortByPositionAndAssignLabels(items);
    expect(result).toHaveLength(3);
    expect(result[0].label).toBe("Person A");
    expect(result[1].label).toBe("Person B");
    expect(result[2].label).toBe("Person C");
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("3");
    expect(result[2].id).toBe("1");
  });

  it("assigns A, B, C, D deterministically", () => {
    const items = [
      { id: "a", box: { x: 0.8, y: 0, w: 0.1, h: 0.1 } },
      { id: "b", box: { x: 0, y: 0, w: 0.1, h: 0.1 } },
      { id: "c", box: { x: 0.4, y: 0, w: 0.1, h: 0.1 } },
      { id: "d", box: { x: 0.2, y: 0, w: 0.1, h: 0.1 } },
    ];
    const result = sortByPositionAndAssignLabels(items);
    expect(result.map((p) => p.label)).toEqual(["Person A", "Person B", "Person C", "Person D"]);
    expect(result.map((p) => p.id)).toEqual(["b", "d", "c", "a"]);
  });

  it("same input order produces same labels (deterministic)", () => {
    const items = [
      { id: "1", box: { x: 0.2, y: 0.2, w: 0.2, h: 0.2 } },
      { id: "2", box: { x: 0.6, y: 0.2, w: 0.2, h: 0.2 } },
    ];
    const a = sortByPositionAndAssignLabels(items);
    const b = sortByPositionAndAssignLabels(items);
    expect(a.map((p) => p.label)).toEqual(b.map((p) => p.label));
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
  });
});
