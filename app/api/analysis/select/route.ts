import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const analysisId = body?.analysisId;
    const selectedLabel = body?.selectedLabel;

    if (!analysisId || !selectedLabel) {
      return NextResponse.json(
        { error: "analysisId and selectedLabel required" },
        { status: 400 }
      );
    }

    const { data: person, error: personErr } = await supabaseAdmin
      .from("analysis_people")
      .select("id")
      .eq("analysis_id", analysisId)
      .eq("label", selectedLabel)
      .single();

    if (personErr || !person) {
      return NextResponse.json(
        { error: "Invalid selection" },
        { status: 400 }
      );
    }

    const { error: updateErr } = await supabaseAdmin
      .from("analyses")
      .update({ selected_label: selectedLabel, status: "analyzing" })
      .eq("id", analysisId);

    if (updateErr) {
      console.error("Select update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to save selection" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Select API error:", e);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
