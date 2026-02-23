import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { openai } from "@/lib/openai/client";
import { DETECT_SYSTEM, DETECT_USER } from "@/lib/analysis/detectPrompt";
import { dedupeFaces } from "@/lib/analysis/dedupeFaces";
import { cropFaceToThumbnail } from "@/lib/analysis/imageCrop";
import { getPersonLabel, labelToPath } from "@/lib/analysis/labels";
import { runDominanceRanking } from "@/src/lib/runDominanceRanking";
import { generateFallbackDominance } from "@/src/lib/dominanceSchema";

export const runtime = "nodejs";

type FaceResult = {
  left_to_right_index: number;
  box: { x: number; y: number; w: number; h: number };
};

function err(message: string, detail?: string) {
  return NextResponse.json(
    { error: message, ...(detail && { detail }) },
    { status: 500 }
  );
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
      .select("id, image_path, status")
      .eq("id", analysisId)
      .single();

    if (fetchErr || !analysis) {
      const msg = fetchErr?.message ?? "Analysis not found";
      console.error("[detect] fetch analysis:", msg);
      return err("Analysis not found", msg);
    }

    const { data: existingPeople, error: existingErr } = await supabaseAdmin
      .from("analysis_people")
      .select("label, face_crop_path, left_to_right_index, crop_box")
      .eq("analysis_id", analysisId)
      .order("left_to_right_index", { ascending: true });

    if (existingErr) {
      console.error("[detect] existing fetch error:", existingErr.message);
    } else if (existingPeople && existingPeople.length > 0) {
      console.log("[detect] already detected, returning existing rows:", existingPeople.length);
      await supabaseAdmin
        .from("analyses")
        .update({ status: "selecting" })
        .eq("id", analysisId);
      return NextResponse.json({ people: existingPeople }, { status: 200 });
    }

    // No people exist. If status is "detecting", a previous run may have crashed or create
    // wrongly set it. Proceed with detection instead of 409, so thumbnails eventually appear.
    await supabaseAdmin
      .from("analyses")
      .update({ status: "detecting" })
      .eq("id", analysisId);

    const imagePath = (analysis.image_path || "").replace(/^\//, "");
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

    const imageBuffer = Buffer.from(await downloadData.arrayBuffer());
    const base64 = imageBuffer.toString("base64");
    const mime = imagePath.endsWith(".png")
      ? "image/png"
      : imagePath.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";

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
        .update({ status: "failed", error_message: "No faces detected" })
        .eq("id", analysisId);
      return NextResponse.json({ error: "No faces detected" }, { status: 400 });
    }

    console.log("[detect] faces returned=%d labels=%s", faces.length, faces.map((_, i) => getPersonLabel(i)).join(", "));

    await supabaseAdmin
      .from("analysis_people")
      .delete()
      .eq("analysis_id", analysisId);

    const results: { label: string; face_crop_path: string }[] = [];

    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      const label = getPersonLabel(i);
      const pathLabel = labelToPath(label);
      const cropPath = `phase1/${analysisId}/${pathLabel}.jpg`.replace(/^\//, "");
      const box = face.box ?? { x: 0, y: 0, w: 0.2, h: 0.25 };

      console.log("[detect] label=%s box=%o", label, box);
      console.log("[detect] crop upload path=%s", cropPath);

      try {
        const cropBuffer = await cropFaceToThumbnail(imageBuffer, box);

        const { error: uploadErr } = await supabaseAdmin.storage
          .from("person-crops")
          .upload(cropPath, cropBuffer, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadErr) {
          console.error("[detect] crop upload error:", uploadErr.message);
          await supabaseAdmin
            .from("analyses")
            .update({ status: "failed", error_message: `Upload crop failed: ${uploadErr.message}` })
            .eq("id", analysisId);
          return err("Failed to upload face crop", uploadErr.message);
        }

        const { error: insertErr } = await supabaseAdmin
          .from("analysis_people")
          .insert({
            analysis_id: analysisId,
            label,
            left_to_right_index: face.left_to_right_index ?? i,
            crop_box: box,
            face_crop_path: cropPath,
          });

        if (insertErr) {
          console.error("[detect] insert people error:", insertErr.message);
          await supabaseAdmin
            .from("analyses")
            .update({ status: "failed", error_message: `Insert failed: ${insertErr.message}` })
            .eq("id", analysisId);
          return err("Failed to save person", insertErr.message);
        }

        results.push({ label, face_crop_path: cropPath });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown";
        console.error("[detect] face loop error:", msg);
        await supabaseAdmin
          .from("analyses")
          .update({ status: "failed", error_message: msg })
          .eq("id", analysisId);
        return err("Face processing failed", msg);
      }
    }

    let dominanceUpdate: { dominance_result_v2?: unknown; dominance_version?: string } = {};
    if (results.length >= 2) {
      try {
        const imageUrl = `data:${mime};base64,${base64}`;
        const labels = results.map((r) => r.label);
        const dominanceResult = await runDominanceRanking({ imageUrl, labels });
        dominanceUpdate = {
          dominance_result_v2: dominanceResult,
          dominance_version: "v2",
        };
      } catch (e) {
        console.error("[detect] dominance ranking error:", e);
        const fallback = generateFallbackDominance(analysisId, results.map((r) => r.label));
        dominanceUpdate = {
          dominance_result_v2: fallback,
          dominance_version: "fallback",
        };
      }
    }

    await supabaseAdmin
      .from("analyses")
      .update({ status: "selecting", ...dominanceUpdate })
      .eq("id", analysisId);

    return NextResponse.json({ people: results });
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
