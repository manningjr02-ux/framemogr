import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const URL_EXPIRY = 60 * 10; // 10 minutes

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

    const { data: people, error } = await supabaseAdmin
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

    const withUrls = await Promise.all(
      people.map(async (p) => {
        const path = p.face_crop_path;
        let signedUrl: string | null = null;
        if (path) {
          try {
            const { data, error: sErr } = await supabaseAdmin.storage
              .from("person-crops")
              .createSignedUrl(path, URL_EXPIRY);
            if (sErr)
              console.error("[people] signedUrl error:", sErr.message, "path=", path);
            signedUrl = data?.signedUrl ?? null;
          } catch (e) {
            console.error("[people] signedUrl exception:", e);
          }
        }
        return {
          label: p.label,
          signedUrl,
          face_crop_path: path ?? null,
        };
      })
    );

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
