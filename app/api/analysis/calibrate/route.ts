import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const analysisId = body?.analysisId;
    const selectedLabel = body?.selectedLabel;
    const answers = body?.answers;
    const version = body?.version ?? "cal_v1";

    if (!analysisId || !selectedLabel) {
      return NextResponse.json(
        { error: "analysisId and selectedLabel required" },
        { status: 400 }
      );
    }

    const answersJson =
      answers && typeof answers === "object" ? answers : {};

    const { error: insertErr } = await supabaseAdmin.from("calibrations").insert({
      analysis_id: analysisId,
      selected_label: String(selectedLabel),
      answers_json: answersJson,
      version: String(version),
    });

    if (insertErr) {
      console.error("Calibrate insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to save calibration" },
        { status: 500 }
      );
    }

    // Also update analyses for run pipeline compatibility (selected_label, calibration_data)
    const calibrationData =
      answers && typeof answers === "object"
        ? {
            selectedLabel: String(selectedLabel),
            answers,
            version: String(version),
          }
        : { selectedLabel: String(selectedLabel) };
    await supabaseAdmin
      .from("analyses")
      .update({
        selected_label: selectedLabel,
        calibration_data: calibrationData,
      })
      .eq("id", analysisId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Calibrate API error:", e);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
