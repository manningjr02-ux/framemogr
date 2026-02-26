"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DetectedPerson } from "@/lib/types/database";

const MARKER_RADIUS = 20;
const MARKER_RADIUS_SELECTED = 24;

type PersonOverlaySelectorProps = {
  imageUrl: string;
  people: DetectedPerson[];
  debug?: boolean;
  onSelect: (personId: string, label: string) => void;
};

/** Extract letter from label e.g. "Person A" -> "A" */
function labelToLetter(label: string): string {
  const match = label.replace(/^Person\s+/i, "").trim();
  return match?.slice(0, 1)?.toUpperCase() || "?";
}

const isDev = process.env.NODE_ENV === "development";

export default function PersonOverlaySelector({
  imageUrl,
  people,
  debug = false,
  onSelect,
}: PersonOverlaySelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const [imageNatural, setImageNatural] = useState<{ w: number; h: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const showDebug = isDev && debug;

  const updateSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w > 0 && h > 0) setContainerSize({ w, h });
  }, []);

  useEffect(() => {
    updateSize();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateSize]);

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (nw > 0 && nh > 0) {
        setImageAspect(nw / nh);
        setImageNatural({ w: nw, h: nh });
      }
    },
    []
  );

  const handleMarkerClick = useCallback(
    (person: DetectedPerson) => {
      setSelectedId(person.id);
      onSelect(person.id, person.label);
    },
    [onSelect]
  );

  if (!imageUrl) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg bg-zinc-900"
      style={imageAspect != null ? { aspectRatio: imageAspect } : undefined}
    >
      <img
        src={imageUrl}
        alt="Select yourself"
        className="h-full w-full object-contain"
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
      />
      {containerSize && people.length > 0 && (
        <OverlayLayer
          people={people}
          containerWidth={containerSize.w}
          containerHeight={containerSize.h}
          imageNatural={imageNatural}
          selectedId={selectedId}
          showDebug={showDebug}
          onMarkerClick={handleMarkerClick}
        />
      )}
    </div>
  );
}

type OverlayLayerProps = {
  people: DetectedPerson[];
  containerWidth: number;
  containerHeight: number;
  imageNatural: { w: number; h: number } | null;
  selectedId: string | null;
  showDebug: boolean;
  onMarkerClick: (person: DetectedPerson) => void;
};

function OverlayLayer({
  people,
  containerWidth,
  containerHeight,
  imageNatural,
  selectedId,
  showDebug,
  onMarkerClick,
}: OverlayLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {showDebug &&
        people.map((person) => {
          const left = person.box.x * containerWidth;
          const top = person.box.y * containerHeight;
          const w = person.box.w * containerWidth;
          const h = person.box.h * containerHeight;
          const imgPx = imageNatural
            ? {
                x: Math.round(person.box.x * imageNatural.w),
                y: Math.round(person.box.y * imageNatural.h),
                w: Math.round(person.box.w * imageNatural.w),
                h: Math.round(person.box.h * imageNatural.h),
              }
            : null;
          return (
            <div
              key={`debug-${person.id}`}
              className="absolute border-2 border-amber-400 bg-amber-400/10"
              style={{ left, top, width: w, height: h }}
            >
              {imgPx && (
                <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-black/80 px-1 py-0.5 font-mono text-xs text-amber-300">
                  {imgPx.x},{imgPx.y} {imgPx.w}×{imgPx.h}px
                </span>
              )}
            </div>
          );
        })}
      <div className="pointer-events-auto relative h-full w-full">
        {people.map((person) => {
          const centerNormX = person.box.x + person.box.w / 2;
          const centerNormY = person.box.y + person.box.h / 2;
          let px = centerNormX * containerWidth;
          let py = centerNormY * containerHeight;
          const r = person.id === selectedId ? MARKER_RADIUS_SELECTED : MARKER_RADIUS;
          px = Math.max(r, Math.min(containerWidth - r, px));
          py = Math.max(r, Math.min(containerHeight - r, py));
          const letter = labelToLetter(person.label);
          const isSelected = person.id === selectedId;

          return (
            <button
              key={person.id}
              type="button"
              onClick={() => onMarkerClick(person)}
              className="absolute flex items-center justify-center rounded-full border-2 font-bold transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
              style={{
                left: px,
                top: py,
                width: r * 2,
                height: r * 2,
                transform: "translate(-50%, -50%)",
                backgroundColor: isSelected ? "rgba(34, 211, 238, 0.35)" : "rgba(0, 0, 0, 0.5)",
                borderColor: isSelected ? "rgb(34, 211, 238)" : "rgba(255, 255, 255, 0.6)",
                color: "white",
                fontSize: isSelected ? 14 : 12,
              }}
              title={person.label}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
