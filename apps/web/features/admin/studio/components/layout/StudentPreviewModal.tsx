import { X } from "lucide-react";

import type { AdminSceneDraft } from "@/features/admin/papers/types/paper-workspace.types";

export function StudentPreviewModal({
  onClose,
  open,
  scene,
}: {
  onClose: () => void;
  open: boolean;
  scene?: AdminSceneDraft;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 p-6 backdrop-blur-sm">
      <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6">
          <div>
            <p className="text-sm font-semibold text-[#1557c0]">
              Student preview
            </p>
            <h2 className="text-xl font-semibold text-slate-950">
              {scene?.title ?? "Untitled scene"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <main className="flex min-h-0 flex-1 items-center justify-center bg-[#0f172a] p-10 text-white">
          <div className="max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
              {scene?.type ?? "concept"} scene
            </p>
            <h1 className="mt-4 text-6xl font-semibold tracking-tight">
              {scene?.title ?? "Preview scene"}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-white/72">
              {scene?.summary ?? "Student-facing scene preview opens here."}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
