import { useState } from "react";
import { CheckCircle2, Circle, FileQuestion, Menu, Plus, X } from "lucide-react";

import type {
  AdminPaperDraft,
  AdminSceneDraft,
} from "@/features/admin/papers/types/paper-workspace.types";
import type {
  AdminSubject,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";

function InlineCreate({
  label,
  onCreate,
  placeholder,
}: {
  label: string;
  onCreate: (title: string) => void;
  placeholder: string;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="mt-2 flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onCreate(value);
        setValue("");
      }}
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="h-9 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
      />
      <button
        type="submit"
        className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#1557c0] px-3 text-xs font-semibold text-white transition hover:bg-[#124cad]"
      >
        <Plus className="h-3.5 w-3.5" />
        {label}
      </button>
    </form>
  );
}

function EditableTitle({
  className,
  onSave,
  value,
}: {
  className?: string;
  onSave: (title: string) => void;
  value: string;
}) {
  const [title, setTitle] = useState(value);

  return (
    <input
      value={title}
      onBlur={() => onSave(title)}
      onChange={(event) => setTitle(event.target.value)}
      className={[
        "min-w-0 rounded-lg border border-transparent bg-transparent px-1 py-1 outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100",
        className,
      ].join(" ")}
    />
  );
}

export function PaperCurriculumPanel({
  activeSceneId,
  draft,
  isOpen = true,
  onAddLesson,
  onAddSubtopic,
  onClose,
  onOpen,
  onRenameModuleAssessment,
  onRenameTopic,
  onRenameTopicalAssessment,
  onSelectScene,
  paper,
  subject,
}: {
  activeSceneId?: string;
  draft: AdminPaperDraft;
  isOpen?: boolean;
  onAddLesson: (topicId: string, subtopicId: string, title: string) => void;
  onAddSubtopic: (topicId: string, title: string) => void;
  onClose?: () => void;
  onOpen?: () => void;
  onRenameModuleAssessment: (title: string) => void;
  onRenameTopic: (topicId: string, title: string) => void;
  onRenameTopicalAssessment: (topicId: string, title: string) => void;
  onSelectScene: (scene: AdminSceneDraft) => void;
  paper: SubjectPaperSummary;
  subject: AdminSubject;
}) {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="hidden min-h-0 w-[74px] shrink-0 place-items-start justify-center rounded-[28px] bg-white/95 px-0 py-8 text-slate-700 shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 transition hover:bg-white hover:text-[#1557c0] lg:grid"
        aria-label="Open curriculum"
      >
        <Menu className="h-7 w-7" />
      </button>
    );
  }

  return (
    <aside className="relative z-10 hidden min-h-0 w-[420px] shrink-0 flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 lg:flex">
      <div className="flex items-start justify-between gap-4 px-7 py-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-950">
            {subject.name}
          </h1>
          <p className="mt-1 truncate text-sm text-slate-500">
            {paper.title} curriculum builder
          </p>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
            aria-label="Close curriculum"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {draft.topics.map((topic) => {
          const lessonCount = topic.subtopics.reduce(
            (total, subtopic) => total + subtopic.lessons.length,
            0,
          );

          return (
            <div
              key={topic.id}
              className="rounded-2xl bg-white p-2 shadow-[0_8px_22px_rgba(15,23,42,0.05)]"
            >
              <div className="px-2 py-2">
                <div className="flex items-center justify-between gap-3">
                  <EditableTitle
                    value={topic.title}
                    onSave={(title) => onRenameTopic(topic.id, title)}
                    className="flex-1 text-sm font-semibold text-slate-950"
                  />
                  <span className="shrink-0 text-xs font-semibold text-slate-500">
                    {lessonCount} lessons
                  </span>
                </div>

                <InlineCreate
                  label="Subtopic"
                  placeholder="New subtopic"
                  onCreate={(title) => onAddSubtopic(topic.id, title)}
                />
              </div>

              <div className="space-y-2">
                {topic.subtopics.map((subtopic) => (
                  <div
                    key={subtopic.id}
                    className="rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-200/70"
                  >
                    <div className="px-2 py-1">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Subtopic
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-slate-950">
                        {subtopic.title}
                      </h3>

                      <InlineCreate
                        label="Lesson"
                        placeholder="New lesson"
                        onCreate={(title) =>
                          onAddLesson(topic.id, subtopic.id, title)
                        }
                      />
                    </div>

                    <div className="mt-2 space-y-1">
                      {subtopic.lessons.map((lesson) => (
                        <div key={lesson.id} className="rounded-xl bg-white p-2">
                          <p className="px-2 text-sm font-semibold text-slate-950">
                            {lesson.title}
                          </p>
                          <p className="px-2 text-xs text-slate-500">
                            {lesson.scenes.length} scenes · {lesson.status}
                          </p>

                          <div className="mt-2 space-y-1">
                            {lesson.scenes.map((scene) => {
                              const active = scene.id === activeSceneId;

                              return (
                                <button
                                  key={scene.id}
                                  type="button"
                                  onClick={() => onSelectScene(scene)}
                                  className={[
                                    "grid w-full grid-cols-[26px_1fr] gap-3 rounded-xl px-3 py-2 text-left transition",
                                    active
                                      ? "bg-[#eaf2ff] text-[#1557c0]"
                                      : "text-slate-700 hover:bg-[#f5f9ff]",
                                  ].join(" ")}
                                >
                                  {scene.order === 1 ? (
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                                  ) : (
                                    <Circle className="mt-0.5 h-4 w-4 text-slate-300" />
                                  )}
                                  <span>
                                    <span className="block text-sm font-semibold">
                                      {scene.title}
                                    </span>
                                    <span className="mt-0.5 block text-xs capitalize text-slate-500">
                                      {scene.type} scene · JSON draft
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="rounded-xl bg-amber-50 p-3 text-amber-900 ring-1 ring-amber-100">
                  <div className="flex gap-2">
                    <FileQuestion className="mt-1 h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <EditableTitle
                        value={topic.topicalAssessmentTitle}
                        onSave={(title) =>
                          onRenameTopicalAssessment(topic.id, title)
                        }
                        className="w-full text-sm font-semibold text-amber-900"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Topical assessment draft
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="rounded-2xl bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
          <div className="grid grid-cols-[32px_1fr] gap-3 text-left text-[#2f6b27]">
            <span className="grid h-7 w-7 place-items-center rounded-md border border-[#2f6b27]">
              <FileQuestion className="h-4 w-4" />
            </span>
            <span>
              <EditableTitle
                value={draft.moduleAssessmentTitle}
                onSave={onRenameModuleAssessment}
                className="w-full text-sm font-semibold text-[#2f6b27]"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Module assessment draft
              </span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
