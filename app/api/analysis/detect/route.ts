import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseAdmin, getGroupUploadImageUrl } from "@/lib/supabase/server";
import { openai } from "@/lib/openai/client";
import { DETECT_SYSTEM, DETECT_USER } from "@/lib/analysis/detectPrompt";
import { dedupeFaces } from "@/lib/analysis/dedupeFaces";
import { sortByPositionAndAssignLabels } from "@/lib/analysis/detectedPeopleSort";
import {
  detectResponseSchema,
  formatDetectValidationError,
} from "@/lib/detectResponseSchema";
import { getPersonLabel } from "@/lib/analysis/labels";
import { runDominanceRanking } from "@/src/lib/runDominanceRanking";
import { generateFallbackDominance } from "@/src/lib/dominanceSchema";
import type { DetectedPerson } from "@/lib/types/database";

export const runtime = "nodejs";

type FaceResult = {
  left_to_right_index: number;
  box: { x: number; y: number; w: number; h: number };
};

/** Clamp box values to [0, 1] for normalized output. */
function clampBox(b: { x: number; y: number; w: number; h: number }): { x: number; y: number; w: number; h: number } {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  return {
    x: clamp(b.x),
    y: clamp(b.y),
    w: clamp(b.w),
    h: clamp(b.h),
  };
}

function err(message: string, detail?: string) {
  return NextResponse.json(
    { error: message, ...(detail && { detail }) },
    { status: 500 }
  );
}

/** Validate detect response payload; returns 422 with structured error if invalid. */
function validateAndMaybeError(payload: {
  imageUrl: string;
  people: DetectedPerson[];
}): NextResponse | null {
  const result = detectResponseSchema.safeParse(payload);
  if (result.success) return null;
  return NextResponse.json(formatDetectValidationError(result), {
    status: 422,
  });
}

export async function POST(req: Request) {
  let analysisId: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    analysisId = typeof body?.analysisId === "string" ? body.analysisId : undefined;
    if (!analysisId) {
      return NextResponse.json({ error: "Missing analysisId" }, { status: 400 });
    }

    console.log("[detect] analysisId", analysisId);

    const { data: analysis, error: fetchErr } = await supabaseAdmin
      .from("analyses")
      .select("id, image_path, status, detected_people")
      .eq("id", analysisId)
      .single();

    if (fetchErr || !analysis) {
      const msg = fetchErr?.message ?? "Analysis not found";
      console.error("[detect] fetch analysis:", msg);
      return err("Analysis not found", msg);
    }

    // If we have stored detected_people, detection already ran — return existing rows (no reshuffling).
    const stored = analysis?.detected_people;
    const hasStoredDetection =
      Array.isArray(stored) && stored.length > 0;

    const imagePath = (analysis?.image_path || "").replace(/^\//, "");

    if (hasStoredDetection) {
      console.log("[detect] detected_people exists, returning stored result:", stored.length);
      await supabaseAdmin
        .from("analyses")
        .update({ status: "selecting" })
        .eq("id", analysisId);
      const people: DetectedPerson[] = stored.map((p) => {
        const raw = p?.box ?? { x: 0, y: 0, w: 0.2, h: 0.25 };
        const box = clampBox({
          x: typeof raw.x === "number" ? raw.x : 0,
          y: typeof raw.y === "number" ? raw.y : 0,
          w: typeof raw.w === "number" ? raw.w : 0.2,
          h: typeof raw.h === "number" ? raw.h : 0.25,
        });
        return {
          id: p?.id ?? randomUUID(),
          label: p?.label ?? "",
          box,
          ...(typeof p?.confidence === "number" && { confidence: p.confidence }),
        };
      });
      const imageUrl = await getGroupUploadImageUrl(analysis.image_path);
      const validationErr = validateAndMaybeError({ imageUrl, people });
      if (validationErr) return validationErr;
      return NextResponse.json({ imageUrl, people }, { status: 200 });
    }

    const { data: existingRows, error: existingErr } = await supabaseAdmin
      .from("analysis_people")
      .select("id, label, crop_box")
      .eq("analysis_id", analysisId)
      .order("left_to_right_index", { ascending: true });

    if (existingErr) {
      console.error("[detect] existing fetch error:", existingErr.message);
    } else if (existingRows && existingRows.length > 0) {
      console.log("[detect] already detected, returning existing rows:", existingRows.length);
      await supabaseAdmin
        .from("analyses")
        .update({ status: "selecting" })
        .eq("id", analysisId);
      const people: DetectedPerson[] = existingRows.map((r) => {
        const raw = (r?.crop_box as { x?: number; y?: number; w?: number; h?: number }) ?? {};
        const box = clampBox({
          x: typeof raw.x === "number" ? raw.x : 0,
          y: typeof raw.y === "number" ? raw.y : 0,
          w: typeof raw.w === "number" ? raw.w : 0.2,
          h: typeof raw.h === "number" ? raw.h : 0.25,
        });
        return {
          id: r?.id ?? randomUUID(),
          label: r?.label ?? "",
          box,
        };
      });
      const imageUrl = await getGroupUploadImageUrl(analysis.image_path);
      const validationErr = validateAndMaybeError({ imageUrl, people });
      if (validationErr) return validationErr;
      return NextResponse.json({ imageUrl, people }, { status: 200 });
    }

    // No people exist. Run detection.
    await supabaseAdmin
      .from("analyses")
      .update({ status: "detecting" })
      .eq("id", analysisId);

    console.log("[detect] downloading image path=%s", imagePath);

    const { data: downloadData, error: downloadErr } = await supabaseAdmin
      .storage
      .from("group-uploads")
      .download(imagePath);

    if (downloadErr || !downloadData) {
      const msg = downloadErr?.message ?? "No data";
      console.error("[detect] download error:", msg);
      await supabaseAdmin
        .from("analyses")
        .update({ status: "failed", error_message: "Failed to download image" })
        .eq("id", analysisId);
      return err("Failed to download image", msg);
    }

    let imageBuffer = Buffer.from(await downloadData.arrayBuffer());
    let mime: string = imagePath.endsWith(".png")
      ? "image/png"
      : imagePath.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";

    // Preprocess for better detection on mobile/compressed photos: fix EXIF orientation
    // (critical for mobile camera photos), ensure minimum resolution for face clarity,
    // cap size for API limits.
    const MIN_SIDE = 768;
    const MAX_SIDE = 2048;
    try {
      let pipe = sharp(imageBuffer).rotate(); // auto-orient from EXIF
      const meta = await pipe.metadata();
      const w = meta.width ?? 1;
      const h = meta.height ?? 1;
      const shortSide = Math.min(w, h);
      const longSide = Math.max(w, h);
      let scale = 1;
      if (shortSide < MIN_SIDE) scale = MIN_SIDE / shortSide;
      if (longSide * scale > MAX_SIDE) scale = MAX_SIDE / longSide;
      if (scale !== 1) {
        const nw = Math.round(w * scale);
        const nh = Math.round(h * scale);
        pipe = pipe.resize(nw, nh, { fit: "inside" });
      }
      imageBuffer = await pipe.jpeg({ quality: 90 }).toBuffer();
      mime = "image/jpeg";
    } catch (preprocessErr) {
      console.warn("[detect] preprocess fallback:", preprocessErr);
      // keep original buffer on error
    }

    const base64 = imageBuffer.toString("base64");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      messages: [
        { role: "system", content: DETECT_SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: DETECT_USER },
            {
              type: "image_url",
              image_url: { url: `data:${mime};base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      await supabaseAdmin
        .from("analyses")
        .update({ status: "failed", error_message: "No response from Vision" })
        .eq("id", analysisId);
      return err("Face detection failed: no response from Vision");
    }

    let parsed: { faces: FaceResult[] };
    try {
      const json = content.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(json);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Parse error";
      console.error("[detect] parse error:", msg, content?.slice(0, 200));
      await supabaseAdmin
        .from("analyses")
        .update({ status: "failed", error_message: "Invalid detection output" })
        .eq("id", analysisId);
      return err("Face detection failed: invalid response", msg);
    }

    const facesRaw = Array.isArray(parsed.faces) ? parsed.faces : [];
    const faces = dedupeFaces(facesRaw, 0.92);

    console.log("[detect] faces raw=%d deduped=%d", facesRaw.length, faces.length);

    if (faces.length === 0) {
      await supabaseAdmin
        .from("analyses")
        .update({ status: "selecting", detected_people: [] })
        .eq("id", analysisId);
      const imageUrl = await getGroupUploadImageUrl(analysis.image_path);
      const validationErr = validateAndMaybeError({ imageUrl, people: [] });
      if (validationErr) return validationErr;
      return NextResponse.json({ imageUrl, people: [] }, { status: 200 });
    }

    const withBoxes = faces.map((face) => {
      const rawBox = face?.box ?? { x: 0, y: 0, w: 0.2, h: 0.25 };
      const box = clampBox(rawBox);
      return { id: randomUUID(), box };
    });
    const detectedPeopleToStore = sortByPositionAndAssignLabels(withBoxes);
    console.log("[detect] faces returned=%d labels=%s", faces.length, detectedPeopleToStore.map((p) => p.label).join(", "));

    let dominanceUpdate: { dominance_result_v2?: unknown; dominance_version?: string } = {};
    if (detectedPeopleToStore.length >= 2) {
      try {
        const imageUrlData = `data:${mime};base64,${base64}`;
        const labels = detectedPeopleToStore.map((p) => p.label);
        const dominanceResult = await runDominanceRanking({ imageUrl: imageUrlData, labels });
        dominanceUpdate = {
          dominance_result_v2: dominanceResult,
          dominance_version: "v2",
        };
      } catch (e) {
        console.error("[detect] dominance ranking error:", e);
        const fallback = generateFallbackDominance(
          analysisId,
          detectedPeopleToStore.map((p) => p.label)
        );
        dominanceUpdate = {
          dominance_result_v2: fallback,
          dominance_version: "fallback",
        };
      }
    }

    await supabaseAdmin
      .from("analyses")
      .update({
        status: "selecting",
        detected_people: detectedPeopleToStore,
        ...dominanceUpdate,
      })
      .eq("id", analysisId);

    const imageUrl = await getGroupUploadImageUrl(analysis.image_path);
    const validationErr = validateAndMaybeError({
      imageUrl,
      people: detectedPeopleToStore,
    });
    if (validationErr) return validationErr;
    return NextResponse.json({ imageUrl, people: detectedPeopleToStore });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[detect] error", e);
    if (analysisId) {
      await supabaseAdmin
        .from("analyses")
        .update({ status: "failed", error_message: msg })
        .eq("id", analysisId);
    }
    return NextResponse.json(
      { error: "Detect failed", detail: msg },
      { status: 500 }
    );
  }
}
