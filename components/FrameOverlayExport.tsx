"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import ScoreOverlay from "./ScoreOverlay";

const EXPORT_WIDTH = 1080;
const PIXEL_RATIO = 2;

type Person = {
  label: string;
  dominance_score: number;
  sort_order: number;
  crop_box: { x: number; y: number; w: number; h: number };
};

type FrameOverlayExportProps = {
  imageUrl: string;
  people: Person[];
  imageWidth: number;
  imageHeight: number;
};

export default function FrameOverlayExport({
  imageUrl,
  people,
  imageWidth,
  imageHeight,
}: FrameOverlayExportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const aspectRatio = imageWidth / imageHeight;
  const exportHeight = Math.round(EXPORT_WIDTH / aspectRatio);

  const handleDownload = async () => {
    if (!containerRef.current) return;
    setDownloading(true);
    let originalSrc: string | null = null;
    try {
      // On mobile, html-to-image often fails to render external images (CORS/tainted canvas).
      // Proxy the image through a data URL so it's same-origin when captured.
      const img = containerRef.current.querySelector<HTMLImageElement>("img");
      if (img && imageUrl && (imageUrl.startsWith("http:") || imageUrl.startsWith("https:"))) {
        try {
          const res = await fetch(imageUrl, { mode: "cors", credentials: "omit" });
          if (res.ok) {
            const blob = await res.blob();
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            originalSrc = img.src;
            img.src = dataUrl;
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          }
        } catch {
          // Fall through to capture with original src if proxy fails
        }
      }

      const dataUrl = await toPng(containerRef.current, {
        pixelRatio: PIXEL_RATIO,
        cacheBust: true,
        includeQueryParams: true,
        fetchRequestInit: { mode: "cors" },
        style: { margin: "0" },
      });
      const link = document.createElement("a");
      link.download = "frame-overlay.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      if (originalSrc != null) {
        const img = containerRef.current?.querySelector<HTMLImageElement>("img");
        if (img) img.src = originalSrc;
      }
      setDownloading(false);
    }
  };

  return (
    <section className="flex flex-col items-center">
      <h2 className="self-start text-2xl font-bold sm:text-3xl">
        Frame Overlay
      </h2>
      <div className="mt-4 w-full overflow-x-auto py-4">
        <div
          ref={containerRef}
          className="mx-auto overflow-hidden rounded-lg bg-zinc-900"
          style={{
            width: EXPORT_WIDTH,
            height: exportHeight,
            minWidth: EXPORT_WIDTH,
          }}
        >
        <ScoreOverlay
          imageUrl={imageUrl}
          people={people}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
        />
        </div>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="mt-4 rounded-lg border border-zinc-600 bg-zinc-800 px-8 py-4 font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
      >
        {downloading ? "Exporting…" : "Download Frame Overlay"}
      </button>
    </section>
  );
}
