import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";
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

    const supabase = supabaseService();
    const { data: people, error } = await supabase
      .from("analysis_people")
      .select("label, face_crop_path")
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

    // Absolute same-origin proxy URLs so thumbnails load on all deployments (avoids CORS and relative-URL issues).
    const origin =
      req.headers.get("x-forwarded-proto") && req.headers.get("x-forwarded-host")
        ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("x-forwarded-host")}`
        : new URL(req.url).origin;

    const withUrls = people.map((p, index) => {
      const path = p.face_crop_path;
      const signedUrl =
        path != null && path !== ""
          ? `${origin}/api/analysis/people/thumbnail?analysisId=${encodeURIComponent(analysisId)}&index=${index}`
          : null;
      return {
        label: p.label,
        signedUrl,
        face_crop_path: path ?? null,
      };
    });

    return NextResponse.json({ people: withUrls });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[people] error:", e);
    return NextResponse.json(
      { error: "An error occurred", detail: msg },
      { status: 500 }
    );
  }
}
