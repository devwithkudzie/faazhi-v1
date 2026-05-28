"use client";

import { Plus } from "lucide-react";

import type { AdminSceneDraft } from "@/features/admin/papers/types/paper-workspace.types";

const interactionTypes = [
  "MCQ",
  "True / false",
  "Fill blanks",
  "Hotspot",
  "Drag / drop",
];

export function InteractTool({
  onAddBlock,
  scene,
}: {
  onAddBlock: (sceneId: string, blockType: string) => void;
  scene?: AdminSceneDraft;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Checkpoints
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Add learner participation blocks without breaking the scene flow.
        </p>

        <div className="mt-3 grid gap-2">
          {interactionTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => scene && onAddBlock(scene.id, "checkpoint")}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-[#1557c0]/40 hover:bg-[#eaf2ff]"
            >
              {type}
              <Plus className="h-3.5 w-3.5 text-[#1557c0]" />
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Logic rules
        </p>
        <div className="mt-3 space-y-2 text-xs text-slate-600">
          <p className="rounded-xl bg-slate-50 p-3">Retry when incorrect</p>
          <p className="rounded-xl bg-slate-50 p-3">Show hints progressively</p>
          <p className="rounded-xl bg-slate-50 p-3">Continue after feedback</p>
        </div>
      </section>
    </div>
  );
}
