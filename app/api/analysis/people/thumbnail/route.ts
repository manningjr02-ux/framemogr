import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNED_URL_EXPIRY = 60; // 1 minute (only used server-side to fetch)

/**
 * Proxies face crop image from Supabase storage so the browser gets same-origin
 * URLs and avoids CORS issues (e.g. on Vercel).
 * GET /api/analysis/people/thumbnail?analysisId=...&index=0
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const analysisId = searchParams.get("analysisId");
    const indexStr = searchParams.get("index");

    if (!analysisId || indexStr == null || indexStr === "") {
      return new NextResponse("Missing analysisId or index", { status: 400 });
    }
    const index = parseInt(indexStr, 10);
    if (Number.isNaN(index) || index < 0) {
      return new NextResponse("Invalid index", { status: 400 });
    }

    const supabase = supabaseService();
    const { data: people, error } = await supabase
      .from("analysis_people")
      .select("face_crop_path")
      .eq("analysis_id", analysisId)
      .order("left_to_right_index", { ascending: true });

    if (error || !people?.length || index >= people.length) {
      return new NextResponse("Not found", { status: 404 });
    }

    const row = people[index];
    if (!row?.face_crop_path) {
      return new NextResponse("Not found", { status: 404 });
    }

    const path = row.face_crop_path;
    const { data: signed, error: signErr } = await supabase.storage
      .from("person-crops")
      .createSignedUrl(path, SIGNED_URL_EXPIRY);

    if (signErr || !signed?.signedUrl) {
      console.error("[thumbnail] signedUrl error:", signErr?.message);
      return new NextResponse("Failed to sign URL", { status: 502 });
    }

    const imageRes = await fetch(signed.signedUrl, { cache: "no-store" });
    if (!imageRes.ok) {
      return new NextResponse("Upstream image error", { status: 502 });
    }

    const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";
    const body = await imageRes.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    console.error("[thumbnail] error:", e);
    return new NextResponse("Internal error", { status: 500 });
  }
}
