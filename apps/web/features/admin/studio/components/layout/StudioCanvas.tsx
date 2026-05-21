import { Code2, MessageSquareText, MousePointerClick, Type } from "lucide-react";

import type { AdminSceneDraft } from "@/features/admin/papers/types/paper-workspace.types";

const blockTypes = [
  { label: "TextBlock", icon: Type },
  { label: "CodeBlock", icon: Code2 },
  { label: "CheckpointBlock", icon: MousePointerClick },
  { label: "CalloutBlock", icon: MessageSquareText },
];

export function StudioCanvas({ scene }: { scene?: AdminSceneDraft }) {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f4f7fb]">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-600">
          <span>Scene</span>
          <span className="text-slate-300">/</span>
          <span className="truncate text-slate-950">
            {scene?.title ?? "Untitled scene"}
          </span>
        </div>
        <div className="flex gap-2">
          {["Lesson tree", "Notes", "Timer", "JSON"].map((pill) => (
            <button
              key={pill}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-8">
        <div className="mx-auto aspect-video max-w-5xl rounded-[28px] bg-white p-10 shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1557c0]">
            {scene?.type ?? "concept"} scene
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950">
            {scene?.title ?? "Create your first learning scene"}
          </h1>
          <div className="mt-8 rounded-3xl bg-emerald-50 p-6 text-2xl leading-10 text-emerald-950 ring-1 ring-emerald-100">
            {scene?.summary ??
              "Use structured blocks for text, diagrams, code, voiceover, and checkpoints."}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {blockTypes.map((block) => {
              const Icon = block.icon;

              return (
                <div
                  key={block.label}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                >
                  <Icon className="h-5 w-5 text-[#1557c0]" />
                  <span className="text-sm font-semibold text-slate-700">
                    {block.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
