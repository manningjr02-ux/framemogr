"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPT = "image/jpeg,image/png,image/webp";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = useCallback((f: File) => {
    if (!ACCEPT.includes(f.type)) {
      return "File must be JPG, PNG, or WebP";
    }
    if (f.size > MAX_SIZE) {
      return "File must be 10MB or smaller";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (f: File | null) => {
      setError(null);
      if (!f) {
        setFile(null);
        return;
      }
      const err = validateFile(f);
      if (err) {
        setError(err);
        setFile(null);
        return;
      }
      setFile(f);
    },
    [validateFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select an image");
      return;
    }
    if (!consent) {
      setError("You must confirm you have permission to upload this photo");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("consent", "true");

      const res = await fetch("/api/analysis/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Upload failed");
        return;
      }

      if (!data.analysisId) {
        setError(data?.error ?? "Upload failed");
        return;
      }

      router.push(`/select?analysisId=${data.analysisId}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-65px)] flex-col items-center bg-zinc-950 py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(34, 211, 238, 0.05) 0%, transparent 60%)",
        }}
      />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <Container className="relative z-10 w-full max-w-xl">
        <h1 className="text-center text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          Upload
        </h1>
        <p className="mt-4 text-center text-lg text-zinc-400 sm:text-xl">
          Drop your group photo here
        </p>

        <form onSubmit={onSubmit} className="mt-12 space-y-8">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`relative rounded-xl border-2 border-dashed px-12 py-16 text-center transition-colors ${
              dragActive
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-zinc-700 bg-zinc-900/50"
            }`}
          >
            <input
              type="file"
              accept={ACCEPT}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              aria-label="Select image file"
            />
            <div className="pointer-events-none relative z-0 text-zinc-400">
              {file ? (
                <span className="font-medium text-white">{file.name}</span>
              ) : (
                <>Drag & drop or click to select (JPG, PNG, WebP — max 10MB)</>
              )}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition-colors hover:border-zinc-700">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-zinc-950"
            />
            <span className="text-sm text-zinc-300">
              I have permission to upload this photo.
            </span>
          </label>

          <p className="text-sm text-zinc-500">
            This ranks who controls the frame in THIS photo only.
          </p>

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3">
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file || !consent}
            className="w-full rounded-lg bg-cyan-500 px-4 py-4 text-lg font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-cyan-500"
          >
            {loading ? "Uploading…" : "Continue"}
          </button>
        </form>
      </Container>
    </main>
  );
}
