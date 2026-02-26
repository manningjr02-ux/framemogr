"use client";

import { useState } from "react";
import Container from "@/components/Container";
import PersonOverlaySelector from "@/components/PersonOverlaySelector";
import type { DetectedPerson } from "@/lib/types/database";

const MOCK_IMAGE = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800";
const MOCK_PEOPLE: DetectedPerson[] = [
  { id: "1", label: "Person A", box: { x: 0.2, y: 0.3, w: 0.2, h: 0.35 } },
  { id: "2", label: "Person B", box: { x: 0.5, y: 0.25, w: 0.22, h: 0.4 } },
  { id: "3", label: "Person C", box: { x: 0.75, y: 0.35, w: 0.18, h: 0.3 } },
];

export default function DevPersonOverlayPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-zinc-950 py-12">
      <Container className="max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-white">
          PersonOverlaySelector (dev)
        </h1>
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <PersonOverlaySelector
            imageUrl={MOCK_IMAGE}
            people={MOCK_PEOPLE}
            onSelect={(personId, label) => {
              setSelected(`${label} (${personId})`);
            }}
          />
        </div>
        {selected && (
          <p className="mt-4 text-zinc-400">
            Selected: <span className="text-cyan-400">{selected}</span>
          </p>
        )}
      </Container>
    </main>
  );
}
