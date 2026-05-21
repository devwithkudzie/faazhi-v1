import type {
  AdminLessonDraft,
  AdminSceneDraft,
} from "@/features/admin/papers/types/paper-workspace.types";

export function PropertiesPanel({
  lesson,
  scene,
}: {
  lesson?: AdminLessonDraft;
  scene?: AdminSceneDraft;
}) {
  return (
    <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-4 2xl:block">
      <h2 className="text-lg font-semibold text-slate-950">Properties</h2>
      <p className="mt-1 text-sm text-slate-500">
        Timing, narration, animation, and interaction settings.
      </p>

      <div className="mt-5 space-y-4">
        <section className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Lesson
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {lesson?.title ?? "No lesson selected"}
          </p>
          <p className="mt-1 text-xs text-[#1557c0]">
            {lesson?.scenes.length ?? 0} scenes
          </p>
        </section>

        <section className="rounded-2xl bg-[#eaf2ff] p-4 ring-1 ring-blue-100">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-500">
            Selected scene
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {scene?.title ?? "No scene selected"}
          </p>
          <p className="mt-1 text-xs capitalize text-[#1557c0]">
            {scene?.type ?? "Select a scene in the timeline"}
          </p>
        </section>

        {["Scene duration", "Voice timing", "Animation", "Transition"].map(
          (label, index) => (
            <label key={label} className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                {label}
              </span>
              <input
                defaultValue={index === 0 ? "12s" : "Auto"}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
              />
            </label>
          ),
        )}
      </div>
    </aside>
  );
}
