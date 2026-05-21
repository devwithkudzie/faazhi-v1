"use client";

import { useState } from "react";
import { CheckpointSurface } from "./CheckpointSurface";
import { CheckpointActions } from "./CheckpointActions";
import type { Scene } from "../../../types";

export function ChoiceCheckpoint({
  scene,
  onContinueScene,
}: {
  scene: Scene;
  onContinueScene?: () => void;
}) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  return (
    <CheckpointSurface
      eyebrow={scene.eyebrow ?? "Checkpoint"}
      title={scene.title}
      icon={<span>✓</span>}
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {scene.choices?.map((choice: string) => (
            <button
              key={choice}
              onClick={() => setSelectedChoice(choice)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left"
            >
              {choice}
            </button>
          ))}
        </div>
      </div>

      <CheckpointActions>
        <button className="rounded-xl border border-slate-200 px-4 py-2">
          Retry
        </button>

        <button
          onClick={onContinueScene}
          disabled={!selectedChoice}
          className="rounded-xl bg-[#1557c0] px-5 py-2 text-white"
        >
          Continue
        </button>
      </CheckpointActions>
    </CheckpointSurface>
  );
}
