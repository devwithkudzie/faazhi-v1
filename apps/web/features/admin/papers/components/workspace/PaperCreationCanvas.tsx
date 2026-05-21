import { MonitorPlay } from "lucide-react";

import type {
  AdminPaperDraft,
  AdminSceneDraft,
} from "@/features/admin/papers/types/paper-workspace.types";

export function PaperCreationCanvas({
  draft,
  scene,
}: {
  draft: AdminPaperDraft;
  scene?: AdminSceneDraft;
}) {
  return (
    <main className="min-w-0 flex-1 overflow-hidden">
      <div className="flex h-full flex-col">
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#0f172a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.28),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(20,184,166,0.18),transparent_30%)]" />
          <div className="relative flex h-full items-center justify-center p-10 text-white">
            <div className="max-w-3xl text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/12 ring-1 ring-white/20">
                <MonitorPlay className="h-8 w-8" />
              </div>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
                {scene?.type ?? "concept"} scene
              </p>
              <h2 className="mt-3 text-5xl font-semibold tracking-tight">
                {scene?.title ?? "Create your first scene"}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/72">
                {scene?.summary ??
                  "Add scenes from the right panel and the JSON draft will update automatically."}
              </p>
            </div>
          </div>
        </div>

        <section className="max-h-[260px] shrink-0 overflow-y-auto border-t border-slate-200 bg-white px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-950">
                JSON draft preview
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                This is the paper workspace content currently saved in browser
                storage as JSON.
              </p>
            </div>
            <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-bold text-[#1557c0]">
              {draft.topics[0]?.subtopics[0]?.lessons[0]?.scenes.length ?? 0} scenes
            </span>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-blue-50">
            {JSON.stringify(draft, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}
