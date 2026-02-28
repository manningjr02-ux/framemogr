import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Start route. Accepts analysisId and optional selectedLabel.
 * If selectedLabel is provided and analysis doesn't have it, updates analyses.
 * Analysis pipeline is triggered by /analyzing page via POST /api/analysis/run.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const analysisId = body?.analysisId;
    const selectedLabel = body?.selectedLabel;

    if (!analysisId) {
      return NextResponse.json(
        { error: "analysisId required" },
        { status: 400 }
      );
    }

    if (selectedLabel && typeof selectedLabel === "string") {
      const { data: analysis } = await supabaseAdmin
        .from("analyses")
        .select("selected_label")
        .eq("id", analysisId)
        .single();
      if (analysis && !analysis.selected_label) {
        await supabaseAdmin
          .from("analyses")
          .update({ selected_label: selectedLabel })
          .eq("id", analysisId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Start API error:", e);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
