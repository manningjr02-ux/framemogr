import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = supabaseService();
    const testPath = "test.txt";
    const bucket = "group-uploads";

    const { error } = await supabase.storage
      .from(bucket)
      .upload(testPath, new Uint8Array([0]), {
        contentType: "text/plain",
        upsert: true,
      });

    if (error) {
      console.error("[debug/storage] upload error:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    const { error: removeError } = await supabase.storage
      .from(bucket)
      .remove([testPath]);

    if (removeError) {
      console.warn("[debug/storage] cleanup:", removeError.message);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[debug/storage] error:", e);
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
