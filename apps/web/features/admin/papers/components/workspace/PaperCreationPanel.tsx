import { type FormEvent, useState } from "react";
import { Check, Database, FileQuestion, Plus, Sparkles } from "lucide-react";

import type {
  AdminLessonDraft,
  AdminSceneDraft,
  AdminSceneType,
  CreateSceneInput,
} from "@/features/admin/papers/types/paper-workspace.types";

const sceneTypes: AdminSceneType[] = [
  "concept",
  "example",
  "diagram",
  "code",
  "checkpoint",
  "exam-extract",
];

export function PaperCreationPanel({
  activeLesson,
  onCreateScene,
  scene,
  storageKey,
}: {
  activeLesson?: AdminLessonDraft;
  onCreateScene: (input: CreateSceneInput) => void;
  scene?: AdminSceneDraft;
  storageKey: string;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AdminSceneType>("concept");
  const [summary, setSummary] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(3);
  const sceneCount = activeLesson?.scenes.length ?? 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreateScene({
      title,
      type,
      summary,
      lessonId: activeLesson?.id,
      durationMinutes,
    });
    setTitle("");
    setType("concept");
    setSummary("");
    setDurationMinutes(3);
  }

  return (
    <aside className="hidden min-h-0 w-[400px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white/96 p-5 xl:block">
      <div className="rounded-3xl bg-[#eaf2ff] p-4 ring-1 ring-blue-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#1557c0]" />
          <h2 className="text-sm font-semibold text-slate-950">
            Create lesson content
          </h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add scenes, checkpoints, and exam-style extracts to this paper
          lesson. Everything remains draft until published.
        </p>
      </div>

      <div className="mt-5 space-y-5">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200/70"
        >
          <h3 className="text-sm font-semibold text-slate-950">
            Add scene to lesson
          </h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Target: {activeLesson?.title ?? "Select or create a lesson"}
          </p>

          <label className="mt-4 block space-y-2">
            <span className="text-xs font-semibold text-slate-500">
              Scene title
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Convert denary to binary"
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="mt-4 block space-y-2">
            <span className="text-xs font-semibold text-slate-500">
              Duration
            </span>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(Number(event.target.value))
              }
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="mt-4 block space-y-2">
            <span className="text-xs font-semibold text-slate-500">
              Scene type
            </span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as AdminSceneType)}
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm capitalize outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
            >
              {sceneTypes.map((sceneType) => (
                <option key={sceneType} value={sceneType}>
                  {sceneType}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block space-y-2">
            <span className="text-xs font-semibold text-slate-500">
              Summary
            </span>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="What should this scene teach?"
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <button
            disabled={!activeLesson}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1557c0] px-4 text-sm font-semibold text-white transition hover:bg-[#124cad] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create scene
          </button>
        </form>

        <button
          onClick={() => {
            setType("exam-extract");
            setTitle("Exam-style question extract");
            setSummary("A digital-paper style question with structured inputs.");
          }}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#edf5ff] px-4 text-sm font-semibold text-[#1557c0] transition hover:bg-[#dbeafe]"
        >
          <FileQuestion className="h-4 w-4" />
          Prepare exam extract
        </button>

        <section className="rounded-3xl bg-white p-4 ring-1 ring-slate-200/70">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-950">
              Created content
            </h3>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {sceneCount} scenes saved in this paper JSON draft.
          </p>
          {scene ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Active scene
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {scene.title}
              </p>
              <p className="mt-1 text-xs capitalize text-[#1557c0]">
                {scene.type}
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl bg-slate-950 p-4 text-white">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-200" />
            <h3 className="text-sm font-semibold">JSON storage</h3>
          </div>
          <p className="mt-2 break-all text-xs leading-5 text-white/68">
            {storageKey}
          </p>
        </section>
      </div>
    </aside>
  );
}
