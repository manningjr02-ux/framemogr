import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { DetectedPerson } from "@/lib/types/database";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const analysisId = body?.analysisId;
    const selectedLabel = body?.selectedLabel;
    const selectedPersonId = body?.selectedPersonId;

    if (!analysisId || !selectedLabel) {
      return NextResponse.json(
        { error: "analysisId and selectedLabel required" },
        { status: 400 }
      );
    }

    // Overlay path: validate selectedPersonId against detected_people
    if (selectedPersonId != null && selectedPersonId !== "") {
      const { data: analysis, error: fetchErr } = await supabaseAdmin
        .from("analyses")
        .select("id, detected_people")
        .eq("id", analysisId)
        .single();

      if (fetchErr || !analysis) {
        return NextResponse.json(
          { error: "Analysis not found" },
          { status: 404 }
        );
      }

      const people = (analysis.detected_people ?? []) as DetectedPerson[];
      const person = people.find((p) => p?.id === selectedPersonId);
      if (!person) {
        return NextResponse.json(
          { error: "Selected person not found" },
          { status: 400 }
        );
      }
      if (person.label !== selectedLabel) {
        return NextResponse.json(
          { error: "Selection mismatch" },
          { status: 400 }
        );
      }

      const { error: updateErr } = await supabaseAdmin
        .from("analyses")
        .update({
          selected_label: selectedLabel,
          selected_person_id: selectedPersonId,
          status: "analyzing",
        })
        .eq("id", analysisId);

      if (updateErr) {
        console.error("Select update error:", updateErr);
        return NextResponse.json(
          { error: "Failed to save selection" },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Legacy grid path: resolve by label in analysis_people
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
