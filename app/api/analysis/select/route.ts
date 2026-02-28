import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { DetectedPerson } from "@/lib/types/database";

export const runtime = "nodejs";

/** Normalize label for comparison: "Person G" and "G" both become "G"; "Person AA" and "AA" become "AA" */
function normalizeLabel(label: string): string {
  const s = (label ?? "").replace(/^Person\s+/i, "").trim();
  return s.toUpperCase() || "";
}

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

    // Overlay path: validate selectedPersonId against detected_people or analysis_people
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
      let person = people.find((p) => p?.id === selectedPersonId);

      // Fallback: match by label when id differs (e.g. string vs uuid coercion)
      if (!person && selectedPersonId) {
        person = people.find(
          (p) =>
            p?.label === selectedLabel ||
            (p?.label && normalizeLabel(p.label) === normalizeLabel(selectedLabel))
        );
      }

      // Fallback: detect may have returned people from analysis_people (ids from DB)
      // when detected_people was empty; validate against analysis_people
      if (!person) {
        const { data: apRow } = await supabaseAdmin
          .from("analysis_people")
          .select("id, label")
          .eq("analysis_id", analysisId)
          .eq("id", selectedPersonId)
          .single();
        const labelMatch =
          apRow &&
          (apRow.label === selectedLabel ||
            normalizeLabel(apRow.label) === normalizeLabel(selectedLabel));
        if (labelMatch && apRow) {
          person = {
            id: apRow.id,
            label: apRow.label,
            box: { x: 0, y: 0, w: 0.2, h: 0.25 },
          };
        }
      }

      // Fallback: resolve by label alone when id lookup failed (e.g. stale ids)
      if (!person) {
        const { data: apRows } = await supabaseAdmin
          .from("analysis_people")
          .select("id, label")
          .eq("analysis_id", analysisId);
        const byLabel = (apRows ?? []).find(
          (r) =>
            r.label === selectedLabel ||
            normalizeLabel(r.label) === normalizeLabel(selectedLabel)
        );
        if (byLabel) {
          person = {
            id: byLabel.id,
            label: byLabel.label,
            box: { x: 0, y: 0, w: 0.2, h: 0.25 },
          };
        }
      }

      if (!person) {
        return NextResponse.json(
          { error: "Selected person not found" },
          { status: 400 }
        );
      }
      if (
        person.label !== selectedLabel &&
        normalizeLabel(person.label) !== normalizeLabel(selectedLabel)
      ) {
        return NextResponse.json(
          { error: "Selection mismatch" },
          { status: 400 }
        );
      }

      const personIdToStore = person.id;

      const { error: updateErr } = await supabaseAdmin
        .from("analyses")
        .update({
          selected_label: selectedLabel,
          selected_person_id: personIdToStore,
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

    // Legacy grid path: resolve by label in analysis_people or detected_people
    const { data: analysis } = await supabaseAdmin
      .from("analyses")
      .select("detected_people")
      .eq("id", analysisId)
      .single();
    const detectedPeople = (analysis?.detected_people ?? []) as DetectedPerson[];
    let legacyPerson = detectedPeople.find(
      (p) =>
        p?.label === selectedLabel ||
        (p?.label && normalizeLabel(p.label) === normalizeLabel(selectedLabel))
    );
    if (!legacyPerson) {
      const { data: apRows } = await supabaseAdmin
        .from("analysis_people")
        .select("id, label")
        .eq("analysis_id", analysisId);
      const apRow = (apRows ?? []).find(
        (r) =>
          r.label === selectedLabel ||
          normalizeLabel(r.label) === normalizeLabel(selectedLabel)
      );
      if (apRow) {
        legacyPerson = {
          id: apRow.id,
          label: apRow.label,
          box: { x: 0, y: 0, w: 0.2, h: 0.25 },
        };
      }
    }
    const person = legacyPerson;

    if (!person) {
      return NextResponse.json(
        { error: "Invalid selection" },
        { status: 400 }
      );
    }

    const { error: updateErr } = await supabaseAdmin
      .from("analyses")
      .update({
        selected_label: selectedLabel,
        selected_person_id: person.id,
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
  } catch (e) {
    console.error("Select API error:", e);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
