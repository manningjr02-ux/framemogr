import { NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "group-uploads";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const consent = formData.get("consent") === "true";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Consent is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be JPG, PNG, or WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File must be 10MB or smaller" },
        { status: 400 }
      );
    }

    console.log("[create] env: url=%s serviceRole=%s", !!process.env.NEXT_PUBLIC_SUPABASE_URL, !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const supabase = supabaseService();
    const analysisId = crypto.randomUUID();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `phase1/${analysisId}/original.${ext}`;

    console.log("[create] bucket=%s path=%s file.type=%s file.size=%d", BUCKET, path, file.type, file.size);

    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[create] upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    let imageWidth: number | null = null;
    let imageHeight: number | null = null;
    try {
      const meta = await sharp(bytes).metadata();
      imageWidth = meta.width ?? null;
      imageHeight = meta.height ?? null;
    } catch {
      // non-fatal
    }

    const { error: insertError } = await supabase.from("analyses").insert({
      id: analysisId,
      image_path: path,
      status: "queued",
      consent_confirmed: true,
      image_width: imageWidth,
      image_height: imageHeight,
    });

    if (insertError) {
      console.error("[create] insert error:", insertError);
      await supabase.storage.from(BUCKET).remove([path]);
      return NextResponse.json(
        { error: `Failed to create analysis: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysisId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[create] error:", e);
    return NextResponse.json(
      { error: `An error occurred: ${msg}` },
      { status: 500 }
    );
  }
}
