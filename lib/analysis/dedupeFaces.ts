export type Box = { x: number; y: number; w: number; h: number };
export type Face = { left_to_right_index: number; box: Box };

function isValidBox(b: unknown): b is Box {
  if (!b || typeof b !== "object") return false;
  const o = b as Record<string, unknown>;
  const x = o.x;
  const y = o.y;
  const w = o.w;
  const h = o.h;
  if (typeof x !== "number" || typeof y !== "number" || typeof w !== "number" || typeof h !== "number")
    return false;
  if (w <= 0 || h <= 0) return false;
  if (x < -0.05 || y < -0.05) return false;
  return true;
}

export function iou(a: Box, b: Box): number {
  const ax1 = a.x;
  const ay1 = a.y;
  const ax2 = a.x + a.w;
  const ay2 = a.y + a.h;
  const bx1 = b.x;
  const by1 = b.y;
  const bx2 = b.x + b.w;
  const by2 = b.y + b.h;

  const ix1 = Math.max(ax1, bx1);
  const iy1 = Math.max(ay1, by1);
  const ix2 = Math.min(ax2, bx2);
  const iy2 = Math.min(ay2, by2);

  if (ix2 <= ix1 || iy2 <= iy1) return 0;

  const inter = (ix2 - ix1) * (iy2 - iy1);
  const areaA = a.w * a.h;
  const areaB = b.w * b.h;
  const union = areaA + areaB - inter;

  return union > 0 ? inter / union : 0;
}

function area(b: Box): number {
  return b.w * b.h;
}

export function dedupeFaces(faces: Face[], threshold = 0.65): Face[] {
  const clampBox = (b: Box): Box => ({
    x: Math.max(0, Math.min(1, b.x)),
    y: Math.max(0, Math.min(1, b.y)),
    w: Math.max(0.02, Math.min(1, b.w)),
    h: Math.max(0.02, Math.min(1, b.h)),
  });

  const filtered = faces.filter((f) => f && isValidBox(f.box)).map((f) => {
    const box = clampBox(f.box);
    const clamped = {
      x: box.x,
      y: box.y,
      w: Math.min(box.w, 1 - box.x),
      h: Math.min(box.h, 1 - box.y),
    };
    return {
      left_to_right_index: typeof f.left_to_right_index === "number" ? f.left_to_right_index : 0,
      box: clamped,
    };
  });

  filtered.sort((a, b) => a.left_to_right_index - b.left_to_right_index);

  const kept: Face[] = [];

  for (const face of filtered) {
    const overlapping = kept.findIndex((k) => iou(face.box, k.box) > threshold);

    if (overlapping === -1) {
      kept.push({ ...face });
    } else {
      const keptFace = kept[overlapping];
      if (area(face.box) > area(keptFace.box)) {
        kept[overlapping] = { ...face };
      }
    }
  }

  kept.sort((a, b) => {
    const ca = a.box.x + a.box.w / 2;
    const cb = b.box.x + b.box.w / 2;
    return ca - cb;
  });

  return kept.map((f, i) => ({
    ...f,
    left_to_right_index: i,
  }));
}
