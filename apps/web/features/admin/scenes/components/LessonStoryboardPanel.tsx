import { Plus } from "lucide-react";

const starterScenes = [
  {
    title: "What is binary?",
    type: "Concept",
    duration: "3 min",
  },
  {
    title: "Convert 178 to binary",
    type: "Example",
    duration: "4 min",
  },
  {
    title: "Quick checkpoint",
    type: "Checkpoint",
    duration: "2 min",
  },
];

export function LessonStoryboardPanel() {
  return (
    <section className="rounded-[28px] bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-950">
          Starter storyboard
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          A lesson becomes a sequence of scenes.
        </p>
      </div>

      <div className="space-y-3">
        {starterScenes.map((scene, index) => (
          <div
            key={scene.title}
            className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200/70"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1557c0] text-sm font-bold text-white">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950">
                {scene.title}
              </p>
              <p className="text-xs text-slate-500">
                {scene.type} · {scene.duration}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#edf5ff] text-sm font-semibold text-[#1557c0] transition hover:bg-[#dbeafe]">
        <Plus className="h-4 w-4" />
        Add scene
      </button>
    </section>
  );
}
