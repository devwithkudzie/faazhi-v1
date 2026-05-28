import { type ReactNode, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  FileQuestion,
  Menu,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import type {
  AdminPaperDraft,
  AdminSceneDraft,
  AdminLessonDraft,
} from "@/features/admin/papers/types/paper-workspace.types";
import {
  getLessonDurationMinutes,
  getPaperDurationMinutes,
  getPaperReadiness,
} from "@/features/admin/papers/services/paper-workspace.service";
import type {
  AdminSubject,
  SubjectPaperSummary,
  PublishStatus,
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

function StatusSelect({
  onChange,
  value = "draft",
}: {
  onChange: (status: PublishStatus) => void;
  value?: PublishStatus;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as PublishStatus)}
      className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold capitalize text-slate-600 outline-none focus:border-[#1557c0]"
    >
      <option value="draft">draft</option>
      <option value="published">published</option>
      <option value="archived">archived</option>
    </select>
  );
}

function MiniButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#1557c0] disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function PaperCurriculumPanel({
  activeSceneId,
  activeLessonId,
  draft,
  isOpen = true,
  onAddTopic,
  onAddLesson,
  onAddSubtopic,
  onClose,
  onOpen,
  onRenameModuleAssessment,
  onDeleteLesson,
  onDeleteScene,
  onDeleteSubtopic,
  onDeleteTopic,
  onMoveLesson,
  onMoveScene,
  onMoveSubtopic,
  onMoveTopic,
  onRenameLesson,
  onRenameSubtopic,
  onRenameTopic,
  onRenameTopicalAssessment,
  onSelectScene,
  onToggleTopicExpanded,
  onUpdateLessonStatus,
  onUpdatePaperMeta,
  onUpdateScene,
  onUpdateSubjectMeta,
  onUpdateTopicStatus,
  paper,
  readiness = getPaperReadiness(draft),
  subject,
}: {
  activeSceneId?: string;
  activeLessonId?: string;
  draft: AdminPaperDraft;
  isOpen?: boolean;
  onAddTopic: (title: string) => void;
  onAddLesson: (topicId: string, subtopicId: string, title: string) => void;
  onAddSubtopic: (topicId: string, title: string) => void;
  onClose?: () => void;
  onOpen?: () => void;
  onRenameModuleAssessment: (title: string) => void;
  onDeleteLesson: (subtopicId: string, lessonId: string) => void;
  onDeleteScene: (sceneId: string) => void;
  onDeleteSubtopic: (topicId: string, subtopicId: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onMoveLesson: (
    subtopicId: string,
    lessonId: string,
    direction: "up" | "down",
  ) => void;
  onMoveScene: (
    lessonId: string,
    sceneId: string,
    direction: "up" | "down",
  ) => void;
  onMoveSubtopic: (
    topicId: string,
    subtopicId: string,
    direction: "up" | "down",
  ) => void;
  onMoveTopic: (topicId: string, direction: "up" | "down") => void;
  onRenameLesson: (lessonId: string, title: string) => void;
  onRenameSubtopic: (subtopicId: string, title: string) => void;
  onRenameTopic: (topicId: string, title: string) => void;
  onRenameTopicalAssessment: (topicId: string, title: string) => void;
  onSelectScene: (scene: AdminSceneDraft) => void;
  onToggleTopicExpanded: (topicId: string) => void;
  onUpdateLessonStatus: (lessonId: string, status: PublishStatus) => void;
  onUpdatePaperMeta: (paperMeta: NonNullable<AdminPaperDraft["paperMeta"]>) => void;
  onUpdateScene: (sceneId: string, updates: Partial<AdminSceneDraft>) => void;
  onUpdateSubjectMeta: (
    subjectMeta: NonNullable<AdminPaperDraft["subjectMeta"]>,
  ) => void;
  onUpdateTopicStatus: (topicId: string, status: PublishStatus) => void;
  paper: SubjectPaperSummary;
  readiness?: ReturnType<typeof getPaperReadiness>;
  subject: AdminSubject;
}) {
  const subjectMeta = draft.subjectMeta ?? {
    title: subject.name,
    code: subject.code,
    description: subject.description,
    learningOutcomes: [],
    skills: [],
    status: subject.status,
  };
  const paperMeta = draft.paperMeta ?? {
    title: paper.title,
    description: "",
    learningOutcomes: [],
    skills: [],
    estimatedMinutes: getPaperDurationMinutes(draft),
    status: paper.status,
  };

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
        <section className="rounded-2xl bg-[#f8fbff] p-4 ring-1 ring-blue-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#1557c0]">
                Subject information
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {readiness.ready ? "Ready to publish" : "Needs content"}
              </p>
            </div>
            <StatusSelect
              value={subjectMeta.status}
              onChange={(status) => onUpdateSubjectMeta({ ...subjectMeta, status })}
            />
          </div>

          <label className="mt-3 block space-y-1">
            <span className="text-xs font-semibold text-slate-500">Description</span>
            <textarea
              value={subjectMeta.description}
              onChange={(event) =>
                onUpdateSubjectMeta({
                  ...subjectMeta,
                  description: event.target.value,
                })
              }
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#1557c0]"
            />
          </label>
          <label className="mt-3 block space-y-1">
            <span className="text-xs font-semibold text-slate-500">
              What students will learn
            </span>
            <textarea
              value={subjectMeta.learningOutcomes.join("\n")}
              onChange={(event) =>
                onUpdateSubjectMeta({
                  ...subjectMeta,
                  learningOutcomes: linesToArray(event.target.value),
                })
              }
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#1557c0]"
            />
          </label>
          <label className="mt-3 block space-y-1">
            <span className="text-xs font-semibold text-slate-500">Skills gained</span>
            <textarea
              value={subjectMeta.skills.join("\n")}
              onChange={(event) =>
                onUpdateSubjectMeta({
                  ...subjectMeta,
                  skills: linesToArray(event.target.value),
                })
              }
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#1557c0]"
            />
          </label>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Paper metadata
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-600">
                {readiness.topicCount} topics · {formatMinutes(getPaperDurationMinutes(draft))} contact time
              </p>
            </div>
            <StatusSelect
              value={paperMeta.status}
              onChange={(status) => onUpdatePaperMeta({ ...paperMeta, status })}
            />
          </div>
          <EditableTitle
            value={paperMeta.title}
            onSave={(title) => onUpdatePaperMeta({ ...paperMeta, title })}
            className="mt-2 w-full text-sm font-semibold text-slate-950"
          />
          <textarea
            value={paperMeta.description}
            onChange={(event) =>
              onUpdatePaperMeta({ ...paperMeta, description: event.target.value })
            }
            rows={2}
            placeholder="Paper/module description"
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#1557c0]"
          />
        </section>

        <InlineCreate
          label="Topic"
          placeholder="New main topic"
          onCreate={onAddTopic}
        />

        {draft.topics.map((topic, topicIndex) => {
          const lessonCount = topic.subtopics.reduce(
            (total, subtopic) => total + subtopic.lessons.length,
            0,
          );
          const expanded = draft.ui?.expandedTopicIds?.includes(topic.id) ?? true;

          return (
            <div
              key={topic.id}
              className="rounded-2xl bg-white p-2 shadow-[0_8px_22px_rgba(15,23,42,0.05)]"
            >
              <div className="px-2 py-2">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleTopicExpanded(topic.id)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                    aria-label="Toggle topic"
                  >
                    <ChevronDown
                      className={[
                        "h-4 w-4 transition",
                        expanded ? "" : "-rotate-90",
                      ].join(" ")}
                    />
                  </button>
                  <EditableTitle
                    value={topic.title}
                    onSave={(title) => onRenameTopic(topic.id, title)}
                    className="flex-1 text-sm font-semibold text-slate-950"
                  />
                  <StatusSelect
                    value={topic.status ?? "draft"}
                    onChange={(status) => onUpdateTopicStatus(topic.id, status)}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between gap-3 px-10">
                  <span className="text-xs font-semibold text-slate-500">
                    {lessonCount} lessons
                  </span>
                  <div className="flex">
                    <MiniButton
                      label="Move topic up"
                      disabled={topicIndex === 0}
                      onClick={() => onMoveTopic(topic.id, "up")}
                    >
                      <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                    </MiniButton>
                    <MiniButton
                      label="Move topic down"
                      disabled={topicIndex === draft.topics.length - 1}
                      onClick={() => onMoveTopic(topic.id, "down")}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </MiniButton>
                    <MiniButton
                      label="Delete topic"
                      onClick={() => onDeleteTopic(topic.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </MiniButton>
                  </div>
                </div>

                {expanded ? (
                  <InlineCreate
                    label="Subtopic"
                    placeholder="New subtopic"
                    onCreate={(title) => onAddSubtopic(topic.id, title)}
                  />
                ) : null}
              </div>

              {expanded ? (
              <div className="space-y-2">
                {topic.subtopics.map((subtopic, subtopicIndex) => (
                  <div
                    key={subtopic.id}
                    className="rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-200/70"
                  >
                    <div className="px-2 py-1">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Subtopic
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <EditableTitle
                          value={subtopic.title}
                          onSave={(title) => onRenameSubtopic(subtopic.id, title)}
                          className="min-w-0 flex-1 text-sm font-semibold text-slate-950"
                        />
                        <MiniButton
                          label="Move subtopic up"
                          disabled={subtopicIndex === 0}
                          onClick={() => onMoveSubtopic(topic.id, subtopic.id, "up")}
                        >
                          <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                        </MiniButton>
                        <MiniButton
                          label="Move subtopic down"
                          disabled={subtopicIndex === topic.subtopics.length - 1}
                          onClick={() =>
                            onMoveSubtopic(topic.id, subtopic.id, "down")
                          }
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </MiniButton>
                        <MiniButton
                          label="Delete subtopic"
                          onClick={() => onDeleteSubtopic(topic.id, subtopic.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </MiniButton>
                      </div>

                      <InlineCreate
                        label="Lesson"
                        placeholder="New lesson"
                        onCreate={(title) =>
                          onAddLesson(topic.id, subtopic.id, title)
                        }
                      />
                    </div>

                    <div className="mt-2 space-y-1">
                      {subtopic.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className={[
                            "rounded-xl bg-white p-2 ring-1",
                            lesson.id === activeLessonId
                              ? "ring-blue-200"
                              : "ring-transparent",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-2 px-2">
                            <EditableTitle
                              value={lesson.title}
                              onSave={(title) => onRenameLesson(lesson.id, title)}
                              className="min-w-0 flex-1 text-sm font-semibold text-slate-950"
                            />
                            <MiniButton
                              label="Move lesson up"
                              disabled={lessonIndex === 0}
                              onClick={() => onMoveLesson(subtopic.id, lesson.id, "up")}
                            >
                              <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                            </MiniButton>
                            <MiniButton
                              label="Move lesson down"
                              disabled={lessonIndex === subtopic.lessons.length - 1}
                              onClick={() =>
                                onMoveLesson(subtopic.id, lesson.id, "down")
                              }
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </MiniButton>
                            <MiniButton
                              label="Delete lesson"
                              onClick={() => onDeleteLesson(subtopic.id, lesson.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </MiniButton>
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-2 px-2">
                            <p className="text-xs text-slate-500">
                              {lesson.scenes.length} scenes · {formatMinutes(getLessonDurationMinutes(lesson as AdminLessonDraft))}
                            </p>
                            <StatusSelect
                              value={lesson.status}
                              onChange={(status) =>
                                onUpdateLessonStatus(lesson.id, status)
                              }
                            />
                          </div>

                          <div className="mt-2 space-y-1">
                            {lesson.scenes.map((scene, sceneIndex) => {
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
                                      {scene.type} · {scene.status} · {formatMinutes(scene.durationMinutes ?? 1)}
                                    </span>
                                  </span>
                                  <span className="col-span-2 mt-2 grid grid-cols-[1fr_auto] gap-2">
                                    <input
                                      value={scene.title}
                                      onClick={(event) => event.stopPropagation()}
                                      onChange={(event) =>
                                        onUpdateScene(scene.id, {
                                          title: event.target.value,
                                        })
                                      }
                                      className="min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#1557c0]"
                                      aria-label="Scene title"
                                    />
                                    <input
                                      type="number"
                                      min={1}
                                      value={scene.durationMinutes ?? 1}
                                      onClick={(event) => event.stopPropagation()}
                                      onChange={(event) =>
                                        onUpdateScene(scene.id, {
                                          durationMinutes: Number(event.target.value),
                                        })
                                      }
                                      className="w-14 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#1557c0]"
                                      aria-label="Scene duration minutes"
                                    />
                                  </span>
                                  <span className="col-span-2 mt-1 flex items-center justify-end gap-1">
                                    <StatusSelect
                                      value={scene.status}
                                      onChange={(status) =>
                                        onUpdateScene(scene.id, { status })
                                      }
                                    />
                                    <MiniButton
                                      label="Move scene up"
                                      disabled={sceneIndex === 0}
                                      onClick={() =>
                                        onMoveScene(lesson.id, scene.id, "up")
                                      }
                                    >
                                      <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                                    </MiniButton>
                                    <MiniButton
                                      label="Move scene down"
                                      disabled={sceneIndex === lesson.scenes.length - 1}
                                      onClick={() =>
                                        onMoveScene(lesson.id, scene.id, "down")
                                      }
                                    >
                                      <ChevronDown className="h-3.5 w-3.5" />
                                    </MiniButton>
                                    <MiniButton
                                      label="Delete scene"
                                      onClick={() => onDeleteScene(scene.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </MiniButton>
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
              ) : null}
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
