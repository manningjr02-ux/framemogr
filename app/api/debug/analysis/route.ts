import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const analysisId = searchParams.get("analysisId");

    if (!analysisId) {
      return NextResponse.json(
        { error: "analysisId required" },
        { status: 400 }
      );
    }

    const { data: analysis, error: aErr } = await supabaseAdmin
      .from("analyses")
      .select("id, status, image_path")
      .eq("id", analysisId)
      .single();

    if (aErr || !analysis) {
      return NextResponse.json(
        { error: "Analysis not found", detail: aErr?.message },
        { status: 404 }
      );
    }

    const { data: people, error: pErr } = await supabaseAdmin
      .from("analysis_people")
      .select("id, label, face_crop_path")
      .eq("analysis_id", analysisId);

    if (pErr) {
      return NextResponse.json(
        { error: "Failed to fetch people", detail: pErr.message },
        { status: 500 }
      );
    }

    const total = people?.length ?? 0;
    const withPath = people?.filter((p) => p.face_crop_path != null).length ?? 0;

    return NextResponse.json({
      analysis: { status: analysis.status, image_path: analysis.image_path },
      analysis_people_count: total,
      with_face_crop_path: withPath,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "An error occurred", detail: msg },
      { status: 500 }
    );
  }
}
