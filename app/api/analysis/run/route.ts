import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { openai } from "@/lib/openai/client";
import { RUN_SYSTEM, getRunUser } from "@/lib/analysis/runPrompt";
import { parseWithRetry, parseRunResponse } from "@/lib/analysis/retry";
import { runFrameMogV2 } from "@/src/lib/runFrameMogV2";

export const runtime = "nodejs";

/** v2 default. Set FRAME_MOG_VERSION=v1 to use legacy pipeline (kill switch). */
const FRAME_MOG_VERSION = process.env.FRAME_MOG_VERSION ?? "v2";

export async function POST(req: Request) {
  let analysisId: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    analysisId = typeof body?.analysisId === "string" ? body.analysisId : undefined;
    if (!analysisId) {
      return NextResponse.json(
        { error: "analysisId required" },
        { status: 400 }
      );
    }

    const { data: analysis, error: fetchErr } = await supabaseAdmin
      .from("analyses")
      .select("id, image_path, selected_label, status, detected_people")
      .eq("id", analysisId)
      .single();

    if (fetchErr || !analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    if (analysis.status === "complete") {
      return NextResponse.json({ ok: true, already_complete: true });
    }

    await supabaseAdmin
      .from("analyses")
      .update({ status: "analyzing", error_message: null })
      .eq("id", analysisId);

    const imagePath = (analysis.image_path || "").replace(/^\//, "");
    const { data: downloadData, error: downloadErr } = await supabaseAdmin
      .storage
      .from("group-uploads")
      .download(imagePath);

    if (downloadErr || !downloadData) {
      await supabaseAdmin
        .from("analyses")
        .update({
          status: "failed",
          error_message: "Failed to download image",
        })
        .eq("id", analysisId);
      return NextResponse.json(
        { error: "Failed to download image" },
        { status: 500 }
      );
    }

    const imageBuffer = Buffer.from(await downloadData.arrayBuffer());
    const base64 = imageBuffer.toString("base64");
    const mime = imagePath.endsWith(".png")
      ? "image/png"
      : imagePath.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
    const imageUrl = `data:${mime};base64,${base64}`;

    if (FRAME_MOG_VERSION === "v2") {
      if (process.env.NODE_ENV === "development") {
        console.log("[run] FrameMog v2 active");
      }
      const v2Result = await runFrameMogV2({ imageUrl });
      const potential_delta =
        v2Result.potential_score - v2Result.overall_score;
      const { error: updateErr } = await supabaseAdmin
        .from("analyses")
        .update({
          current_score: v2Result.overall_score,
          potential_score: v2Result.potential_score,
          potential_delta,
          result_v2: v2Result,
          analysis_version: "v2",
          status: "complete",
          error_message: null,
        })
        .eq("id", analysisId);
      if (updateErr) {
        console.error("[run] v2 update error:", updateErr);
        await supabaseAdmin
          .from("analyses")
          .update({
            status: "failed",
            error_message: "Failed to save results",
          })
          .eq("id", analysisId);
        return NextResponse.json(
          { error: "Failed to save results", detail: updateErr.message },
          { status: 500 }
        );
      }
      return NextResponse.json({
        ok: true,
        analysis_version: "v2",
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[run] FrameMog v1 (kill switch)");
    }
    if (!analysis.selected_label) {
      await supabaseAdmin
        .from("analyses")
        .update({
          status: "failed",
          error_message: "No selection. Pick yourself on the select page first.",
        })
        .eq("id", analysisId);
      return NextResponse.json(
        { error: "No selection. Pick yourself on the select page first." },
        { status: 400 }
      );
    }

    const { data: dbPeopleForPrompt, error: pplErr } = await supabaseAdmin
      .from("analysis_people")
      .select("label")
      .eq("analysis_id", analysisId);

    const detectedPeople = (analysis?.detected_people ?? []) as Array<{
      id: string;
      label: string;
      box: { x: number; y: number; w: number; h: number };
    }>;
    const labelsFromDetected = detectedPeople.map((p) => p.label);

    let labels: string[];
    if (dbPeopleForPrompt?.length) {
      labels = dbPeopleForPrompt.map((p) => p.label);
    } else if (labelsFromDetected.length) {
      labels = labelsFromDetected;
    } else {
      if (pplErr) {
        console.error("[run] analysis_people error:", pplErr);
      }
      await supabaseAdmin
        .from("analyses")
        .update({ status: "failed", error_message: "No detected faces found" })
        .eq("id", analysisId);
      return NextResponse.json(
        { error: "No detected faces found" },
        { status: 400 }
      );
    }

    let lastRaw = "";
    const runVision = async () => {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: RUN_SYSTEM },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: getRunUser(analysis.selected_label, labels),
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 4096,
      });
      const raw = completion.choices[0]?.message?.content?.trim();
      if (!raw) throw new Error("No response from Vision");
      lastRaw = raw;

      let cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
      const first = cleaned.indexOf("{");
      const last = cleaned.lastIndexOf("}");
      if (first !== -1 && last !== -1 && last > first) {
        cleaned = cleaned.slice(first, last + 1);
      }
      return cleaned;
    };

    let result;
    try {
      result = await parseWithRetry(runVision, parseRunResponse);
    } catch (parseErr) {
      console.error("[run] parse failed:", parseErr);
      console.error("[run] raw head:", lastRaw.slice(0, 800));
      await supabaseAdmin
        .from("analyses")
        .update({
          status: "failed",
          error_message: "Invalid analysis response (parse_openai)",
        })
        .eq("id", analysisId);
      return NextResponse.json(
        {
          error: "Analysis failed",
          detail: String(parseErr),
          step: "parse_openai",
        },
        { status: 500 }
      );
    }

    const peopleByLabel = new Map(result.people.map((p) => [p.label, p]));
    const sortedPeople = [...result.people].sort(
      (a, b) => b.dominance_score - a.dominance_score
    );
    const sortOrderByLabel = new Map(
      sortedPeople.map((p, i) => [p.label, i])
    );

    let dbPeople = (
      await supabaseAdmin
        .from("analysis_people")
        .select("id, label")
        .eq("analysis_id", analysisId)
    ).data ?? [];

    if (!dbPeople.length && detectedPeople.length) {
      for (let i = 0; i < detectedPeople.length; i++) {
        const d = detectedPeople[i];
        await supabaseAdmin.from("analysis_people").insert({
          analysis_id: analysisId,
          label: d.label,
          left_to_right_index: i,
          sort_order: i,
          crop_box: d.box ?? {},
        });
      }
      dbPeople =
        (await supabaseAdmin
          .from("analysis_people")
          .select("id, label")
          .eq("analysis_id", analysisId))
          .data ?? [];
    }

    if (dbPeople.length) {
      for (const p of dbPeople) {
        const api = peopleByLabel.get(p.label);
        if (!api) continue;
        await supabaseAdmin
          .from("analysis_people")
          .update({
            dominance_score: api.dominance_score,
            frame_authority: api.breakdown.frame_authority,
            fit_precision: api.breakdown.fit_precision,
            grooming_timing: api.breakdown.grooming_timing,
            camera_positioning: api.breakdown.camera_positioning,
            posture_control: api.breakdown.posture_control,
            aura_expression: api.breakdown.aura_expression,
            strengths: api.strengths,
            weaknesses: api.weaknesses,
            sort_order: sortOrderByLabel.get(p.label) ?? 0,
          })
          .eq("id", p.id);
      }
    }

    const potential_delta = result.potential_score - result.current_score;

    const { error: updateErr } = await supabaseAdmin
      .from("analyses")
      .update({
        current_score: result.current_score,
        potential_score: result.potential_score,
        potential_delta,
        ai_summary: {
          global_signals: result.global_signals,
          photo_context: result.photo_context,
          frame_leaks: result.frame_leaks,
          doing_right: result.doing_right,
        },
        status: "complete",
        error_message: null,
      })
      .eq("id", analysisId);

    if (updateErr) {
      console.error("[run] v1 update error:", updateErr);
      await supabaseAdmin
        .from("analyses")
        .update({
          status: "failed",
          error_message: "Failed to save results",
        })
        .eq("id", analysisId);
      return NextResponse.json(
        { error: "Failed to save results", detail: updateErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      analysis_version: "v1",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[run] error:", msg, e);
    if (analysisId) {
      await supabaseAdmin
        .from("analyses")
        .update({ status: "failed", error_message: msg })
        .eq("id", analysisId);
    }
    return NextResponse.json(
      { error: "Analysis failed", detail: msg },
      { status: 500 }
    );
  }
}
