import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Leaderboard from "@/components/Leaderboard";
import ScoreDelta from "@/components/ScoreDelta";
import { MogCardTrigger } from "@/components/MogCardModal";
import ResultsBreakdownGrid from "@/components/ResultsBreakdownGrid";
import ResultsTopMove from "@/components/ResultsTopMove";
import ResultsInsights from "@/components/ResultsInsights";
import FrameOverlayExport from "@/components/FrameOverlayExport";
import { supabaseAdmin, getGroupUploadImageUrl } from "@/lib/supabase/server";
import {
  normalizeFrameMogResult,
  deriveScoreBreakdown,
} from "@/src/lib/normalizeFrameMogResult";
import { getMetricLabel } from "@/src/lib/frameMogLabels";
import {
  clampAndSanitizeDominanceResult,
  type DominanceResult,
} from "@/src/lib/dominanceSchema";
import type { ScoreBreakdownKey } from "@/src/lib/frameMogSchema";

const BREAKDOWN_KEYS: ScoreBreakdownKey[] = [
  "frame",
  "posture",
  "presence",
  "composition",
  "expression",
  "style",
];

function getWeakestMetricLabel(
  breakdown: Record<string, number>,
  photoType: string
): string {
  let minKey: ScoreBreakdownKey | null = null;
  let minVal = 101;
  for (const k of BREAKDOWN_KEYS) {
    const v = breakdown[k] ?? 100;
    if (v < minVal) {
      minVal = v;
      minKey = k;
    }
  }
  return minKey ? getMetricLabel(photoType, minKey) : "—";
}

type PageProps = {
  searchParams: { analysisId?: string | string[] };
};

export default async function ResultsPage({ searchParams }: PageProps) {
  const analysisId =
    typeof searchParams.analysisId === "string"
      ? searchParams.analysisId
      : searchParams.analysisId?.[0];

  if (!analysisId) {
    notFound();
  }

  const { data: analysis, error: analysisErr } = await supabaseAdmin
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .single();

  if (analysisErr || !analysis || analysis.status !== "complete") {
    notFound();
  }

  const normalized = normalizeFrameMogResult(analysis);
  const selectedLabel = analysis.selected_label ?? "";

  const dominanceRaw = analysis.dominance_result_v2 as unknown;
  const hasDominance =
    dominanceRaw &&
    typeof dominanceRaw === "object" &&
    Array.isArray((dominanceRaw as DominanceResult).people) &&
    ((dominanceRaw as DominanceResult).people?.length ?? 0) >= 2;

  const dominance = hasDominance
    ? clampAndSanitizeDominanceResult(dominanceRaw)
    : null;

  const selectedPersonInDominance = dominance
    ? dominance.people.find(
        (p) =>
          p.label.trim().toLowerCase() === selectedLabel.trim().toLowerCase()
      )
    : null;

  const displayNormalized =
    selectedPersonInDominance != null
      ? {
          ...normalized,
          overall_score: selectedPersonInDominance.dominance_score,
          potential_score: Math.min(
            100,
            selectedPersonInDominance.dominance_score +
              Math.max(0, normalized.potential_score - normalized.overall_score)
          ),
          score_breakdown: deriveScoreBreakdown(
            selectedPersonInDominance.dominance_score
          ),
        }
      : normalized;

  const { data: people } = await supabaseAdmin
    .from("analysis_people")
    .select("*")
    .eq("analysis_id", analysisId)
    .order("sort_order", { ascending: true });

  const detectedPeople = (analysis.detected_people ?? []) as Array<{
    id?: string;
    label: string;
    box: { x: number; y: number; w: number; h: number };
  }>;
  const peopleFromDb = people ?? [];
  const peopleList =
    peopleFromDb.length > 0
      ? peopleFromDb
      : detectedPeople.map((p, i) => ({
          label: p.label,
          crop_box: p.box,
          sort_order: i,
        }));
  const N = peopleList.length;

  let leaderboardItems: Array<{
    rank: number;
    label: string;
    dominance_score: number | null;
    isYou: boolean;
  }>;
  let totalPeople: number;
  let yourRank: number | null;
  let scoring: boolean;

  if (dominance) {
    const sorted = [...dominance.people].sort(
      (a, b) => b.dominance_score - a.dominance_score
    );
    totalPeople = dominance.total_people;
    yourRank =
      dominance.user_rank ??
      (selectedLabel
        ? (() => {
            const idx = sorted.findIndex(
              (p) =>
                p.label.trim().toLowerCase() ===
                selectedLabel.trim().toLowerCase()
            );
            return idx >= 0 ? idx + 1 : null;
          })()
        : null);
    leaderboardItems = sorted.map((p, i) => ({
      rank: i + 1,
      label: p.label,
      dominance_score: p.dominance_score,
      isYou:
        p.label.trim().toLowerCase() === selectedLabel.trim().toLowerCase(),
    }));
    scoring = false;
  } else {
    totalPeople = Math.max(1, N);
    yourRank = selectedLabel
      ? (peopleList.findIndex((p) => p.label === selectedLabel) ?? 0) + 1
      : null;
    leaderboardItems = peopleList.map((p, i) => ({
      rank: i + 1,
      label: p.label,
      dominance_score: null as number | null,
      isYou: p.label === selectedLabel,
    }));
    scoring = true;
  }

  const imageUrl = await getGroupUploadImageUrl(analysis.image_path);
  const imageWidth = analysis.image_width ?? 1080;
  const imageHeight = analysis.image_height ?? 1920;

  const lowestMetric = getWeakestMetricLabel(
    displayNormalized.score_breakdown,
    displayNormalized.photo_type
  );

  const peopleWithScores = dominance
    ? peopleList.map((p) => {
        const dp = dominance.people.find(
          (d) =>
            d.label.trim().toLowerCase() === p.label.trim().toLowerCase()
        );
        return { ...p, dominance_score: dp?.dominance_score ?? 0 };
      })
    : peopleList.map((p) => ({ ...p, dominance_score: 0 }));

  const overlayPeople = peopleWithScores
    .filter(
      (p) => p.crop_box && typeof (p.crop_box as { x?: number }).x === "number"
    )
    .map((p) => ({
      label: p.label,
      dominance_score: p.dominance_score ?? 0,
      sort_order: p.sort_order ?? 0,
      crop_box: p.crop_box as { x: number; y: number; w: number; h: number },
    }));

  return (
    <main className="min-h-[calc(100vh-65px)] py-12">
      <Container className="space-y-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            Results
          </h1>
          <p className="mt-4 text-lg text-zinc-400 sm:text-xl">
            Frame dominance rankings
          </p>
        </div>

        {N > 0 && (
          <Leaderboard
            items={leaderboardItems}
            totalPeople={totalPeople}
            userRank={yourRank}
            scoring={scoring}
          />
        )}

        <div className="flex flex-col gap-4">
          <ScoreDelta
            currentScore={displayNormalized.overall_score}
            potentialScore={displayNormalized.potential_score}
            potentialDelta={
              displayNormalized.potential_score - displayNormalized.overall_score
            }
            yourRank={yourRank ?? 1}
            totalPeople={totalPeople}
          />
          <MogCardTrigger
            currentScore={displayNormalized.overall_score}
            potentialScore={displayNormalized.potential_score}
            currentRank={yourRank ?? 1}
            totalPeople={totalPeople}
            lowestMetric={lowestMetric}
          />
        </div>

        <ResultsBreakdownGrid data={displayNormalized} />

        <ResultsTopMove data={displayNormalized} />

        <ResultsInsights data={displayNormalized} />

        {imageUrl && overlayPeople.length > 0 && (
          <FrameOverlayExport
            imageUrl={imageUrl}
            people={overlayPeople}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
          />
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/upload"
            className="rounded-lg bg-cyan-500 px-8 py-4 text-center font-semibold text-black transition hover:bg-cyan-400"
          >
            Run it back
          </Link>
        </div>
      </Container>
    </main>
  );
}
