import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

    const { data: analysis, error } = await supabaseAdmin
      .from("analyses")
      .select("status, error_message")
      .eq("id", analysisId)
      .single();

    if (error || !analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: analysis.status,
      ...(analysis.error_message && { error_message: analysis.error_message }),
    });
  } catch (e) {
    console.error("Status API error:", e);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
