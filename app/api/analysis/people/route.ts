import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns detected people for an analysis (labels only).
 * Original image and detected_people are used; no image URLs returned.
 */
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

    const supabase = supabaseService();
    const { data: people, error } = await supabase
      .from("analysis_people")
      .select("label")
      .eq("analysis_id", analysisId)
      .order("left_to_right_index", { ascending: true });

    if (error) {
      console.error("[people] fetch error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch people", detail: error.message },
        { status: 500 }
      );
    }

    if (!people || people.length === 0) {
      return NextResponse.json({ people: [] });
    }

    const list = people.map((p) => ({
      label: p?.label ?? null,
    }));

    return NextResponse.json({ people: list });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[people] error:", e);
    return NextResponse.json(
      { error: "An error occurred", detail: msg },
      { status: 500 }
    );
  }
}
