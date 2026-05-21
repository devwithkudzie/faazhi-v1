import { Plus } from "lucide-react";

import type {
  AdminSceneDraft,
  AdminSceneType,
} from "@/features/admin/papers/types/paper-workspace.types";

const sceneTypes: AdminSceneType[] = [
  "concept",
  "example",
  "diagram",
  "code",
  "checkpoint",
  "exam-extract",
];

export function SceneTool({
  onCreateScene,
  scene,
}: {
  onCreateScene: (type: AdminSceneType) => void;
  scene?: AdminSceneDraft;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-[#eaf2ff] p-4 ring-1 ring-blue-100">
        <h3 className="text-sm font-semibold text-slate-950">
          Selected scene
        </h3>
        <p className="mt-2 text-lg font-semibold text-[#1557c0]">
          {scene?.title ?? "No scene selected"}
        </p>
        <p className="mt-1 text-sm capitalize text-slate-500">
          {scene?.type ?? "Select a scene"}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          Add scene
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {sceneTypes.map((type) => (
            <button
              key={type}
              onClick={() => onCreateScene(type)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 text-xs font-semibold capitalize text-slate-700 ring-1 ring-slate-200 transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
            >
              <Plus className="h-3.5 w-3.5" />
              {type.replace("-", " ")}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
