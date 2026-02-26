import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNED_URL_EXPIRY = 60; // 1 minute (only used server-side to fetch)

/**
 * Proxies face crop image from Supabase storage so the browser gets same-origin
 * URLs and avoids CORS issues (e.g. on Vercel).
 * GET /api/analysis/people/thumbnail?analysisId=...&label=...
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const analysisId = searchParams.get("analysisId");
    const label = searchParams.get("label");

    if (!analysisId || label == null || label === "") {
      return new NextResponse("Missing analysisId or label", { status: 400 });
    }

    const { data: row, error } = await supabaseAdmin
      .from("analysis_people")
      .select("face_crop_path")
      .eq("analysis_id", analysisId)
      .eq("label", label)
      .maybeSingle();

    if (error || !row?.face_crop_path) {
      return new NextResponse("Not found", { status: 404 });
    }

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("person-crops")
      .createSignedUrl(row.face_crop_path, SIGNED_URL_EXPIRY);

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
