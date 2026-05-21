import type { AdminSceneDraft, AdminSceneType } from "@/features/admin/papers/types/paper-workspace.types";

const sceneLabels: Record<AdminSceneType, string> = {
  concept: "Concept slide",
  example: "Example",
  diagram: "Diagram",
  code: "Code",
  checkpoint: "Checkpoint",
  "exam-extract": "Exam extract",
};

export function StudioTimeline({
  activeSceneId,
  lessonTitle,
  onCreateScene,
  onSelectScene,
  scenes,
}: {
  activeSceneId?: string;
  lessonTitle: string;
  onCreateScene: (type: AdminSceneType) => void;
  onSelectScene: (scene: AdminSceneDraft) => void;
  scenes: AdminSceneDraft[];
}) {
  return (
    <footer className="flex h-[118px] shrink-0 items-center gap-4 border-t border-slate-200 bg-white px-5">
      <div className="w-48 shrink-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          Scene timeline
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-950">
          {lessonTitle}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{scenes.length} scenes</p>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto py-2">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => onSelectScene(scene)}
            className={[
              "min-w-36 rounded-2xl border p-3 text-left transition",
              scene.id === activeSceneId
                ? "border-blue-200 bg-[#eaf2ff]"
                : "border-slate-200 bg-slate-50 hover:bg-white",
            ].join(" ")}
          >
            <p className="truncate text-xs font-semibold text-slate-500">
              0:{String(scene.order * 5).padStart(2, "0")}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-950">
              {scene.title}
            </p>
            <p className="mt-1 truncate text-xs capitalize text-[#1557c0]">
              {sceneLabels[scene.type]}
            </p>
          </button>
        ))}
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2">
        {(["concept", "example", "checkpoint", "exam-extract"] as AdminSceneType[]).map(
          (type) => (
            <button
              key={type}
              onClick={() => onCreateScene(type)}
              className="h-9 rounded-xl bg-[#eaf2ff] px-3 text-xs font-semibold capitalize text-[#1557c0] transition hover:bg-[#dbeafe]"
            >
              + {type.replace("-", " ")}
            </button>
          ),
        )}
      </div>
    </footer>
  );
}
