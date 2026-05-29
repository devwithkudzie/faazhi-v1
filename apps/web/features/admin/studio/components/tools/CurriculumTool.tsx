"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileQuestion,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import type {
  AdminLessonDraft,
  AdminPaperDraft,
} from "@/features/admin/papers/types/paper-workspace.types";
import type { PublishStatus } from "@/features/admin/subjects/types/subject.types";

type MoveDirection = "up" | "down";
type SelectedAssessmentTarget =
  | { type: "topical"; topicId: string }
  | { type: "module" };
const statusOptions: PublishStatus[] = ["draft", "published", "archived"];

function topicStatusClass(status: PublishStatus) {
  if (status === "published") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 ring-emerald-200";
  }

  if (status === "archived") {
    return "border-slate-200 bg-slate-100 text-slate-500 ring-slate-200";
  }

  return "border-amber-200 bg-amber-50 text-amber-800 ring-amber-200";
}

function InlineEditableTitle({
  ariaLabel,
  className,
  inputClassName,
  onSave,
  value,
}: {
  ariaLabel: string;
  className: string;
  inputClassName?: string;
  onSave: (title: string) => void;
  value: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextBlurRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function commitEdit() {
    const nextTitle = draftValue.trim();

    if (nextTitle && nextTitle !== value) {
      onSave(nextTitle);
    }

    setIsEditing(false);
  }

  function cancelEdit() {
    skipNextBlurRef.current = true;
    setDraftValue(value);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        aria-label={ariaLabel}
        value={draftValue}
        onBlur={() => {
          if (skipNextBlurRef.current) {
            skipNextBlurRef.current = false;
            return;
          }

          commitEdit();
        }}
        onChange={(event) => setDraftValue(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            cancelEdit();
          }
        }}
        className={[
          "min-w-0 rounded-md border border-blue-200 bg-white px-1.5 py-0.5 outline-none transition focus:border-[#1557c0] focus:ring-2 focus:ring-[#1557c0]/10",
          inputClassName ?? "",
        ].join(" ")}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation();
        setDraftValue(value);
        setIsEditing(true);
      }}
      className={[
        "group inline-flex min-w-0 max-w-full items-center gap-1 rounded-md px-1 py-0.5 text-left transition hover:bg-white/70",
        className,
      ].join(" ")}
    >
      <span className="min-w-0 truncate">{value}</span>
      <span
        aria-hidden="true"
        className="shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100"
      >
        |
      </span>
    </button>
  );
}

export function CurriculumTool({
  activeLessonId,
  draft,
  expandedTopicIds,
  onSelectLesson,
  onCreateTopic,
  onCreateLesson,
  onDeleteLesson,
  onDeleteTopic,
  onMoveTopic,
  onMoveLesson,
  onRenameLesson,
  onRenameTopic,
  onSelectAssessmentTarget,
  onUpdateTopicStatus,
  onToggleTopic,
}: {
  activeLessonId?: string;
  draft: AdminPaperDraft;
  expandedTopicIds: string[];
  onSelectLesson: (lesson: AdminLessonDraft) => void;
  onCreateTopic: (title: string) => void;
  onCreateLesson: (subtopicId: string, title: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onMoveTopic: (topicId: string, direction: MoveDirection) => void;
  onMoveLesson: (
    subtopicId: string,
    lessonId: string,
    direction: MoveDirection,
  ) => void;
  onRenameLesson: (lessonId: string, title: string) => void;
  onRenameTopic: (topicId: string, title: string) => void;
  onSelectAssessmentTarget: (target: SelectedAssessmentTarget) => void;
  onUpdateTopicStatus: (topicId: string, status: PublishStatus) => void;
  onToggleTopic: (topicId: string) => void;
}) {
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [statusMenuTopicId, setStatusMenuTopicId] = useState<string | null>(
    null,
  );

  const [creatingLessonForSubtopicId, setCreatingLessonForSubtopicId] =
    useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");

  function cancelTopicCreate() {
    setCreatingTopic(false);
    setTopicTitle("");
  }

  function submitTopicCreate() {
    const title = topicTitle.trim();
    if (!title) return;

    onCreateTopic(title);
    cancelTopicCreate();
  }

  function cancelLessonCreate() {
    setCreatingLessonForSubtopicId(null);
    setLessonTitle("");
  }

  function submitLessonCreate(subtopicId: string) {
    const title = lessonTitle.trim();
    if (!title) return;

    onCreateLesson(subtopicId, title);
    cancelLessonCreate();
  }

  return (
    <div className="space-y-1.5">
      <div className="rounded-xl bg-[#eef4ff] px-2.5 py-2 ring-1 ring-blue-100">
        <div className="flex items-center justify-between gap-2">
              <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
              Curriculum
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-600">
              Topics → subtopics → lessons
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreatingTopic(true)}
            className="inline-flex h-6 items-center gap-1 rounded-lg bg-[#1557c0] px-2 text-[10px] font-semibold text-white transition hover:bg-[#124aa3]"
          >
            <Plus className="h-3.5 w-3.5" />
            Topic
          </button>
        </div>
      </div>

      {draft.topics.map((topic, topicIndex) => {
        const isOpen = expandedTopicIds.includes(topic.id);

        return (
          <section
            key={topic.id}
            className={[
              "rounded-xl border p-2 ring-1 transition",
              topicStatusClass(topic.status ?? "draft"),
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onToggleTopic(topic.id)}
                className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-white ring-1 ring-slate-200 transition hover:bg-slate-50"
                title={isOpen ? "Collapse topic" : "Expand topic"}
                aria-label={isOpen ? "Collapse topic" : "Expand topic"}
              >
                <span className="h-2.5 w-2.5 rounded-sm bg-[#1557c0]" />
              </button>

              <InlineEditableTitle
                ariaLabel="Rename topic"
                value={topic.title}
                onSave={(title) => onRenameTopic(topic.id, title)}
                className="flex-1 text-xs font-semibold text-slate-900"
                inputClassName="h-6 flex-1 text-xs font-semibold text-slate-900"
              />

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={topicIndex === 0}
                  onClick={() => onMoveTopic(topic.id, "up")}
                  className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Move topic up"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>

                <button
                  type="button"
                  disabled={topicIndex === draft.topics.length - 1}
                  onClick={() => onMoveTopic(topic.id, "down")}
                  className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Move topic down"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete ${topic.title}?`)) {
                      onDeleteTopic(topic.id);
                    }
                  }}
                  className="grid h-6 w-6 place-items-center rounded-md text-rose-400 transition hover:bg-rose-50 hover:text-rose-700"
                  title="Delete topic"
                >
                  <Trash2 className="h-3 w-3" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setStatusMenuTopicId((current) =>
                        current === topic.id ? null : topic.id,
                      )
                    }
                    className="grid h-6 w-6 place-items-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-[#1557c0]"
                    title="Topic status"
                    aria-label="Topic status"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>

                  {statusMenuTopicId === topic.id ? (
                    <div className="absolute right-0 top-7 z-20 w-32 overflow-hidden rounded-lg bg-white py-1 shadow-xl ring-1 ring-slate-200">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            onUpdateTopicStatus(topic.id, status);
                            setStatusMenuTopicId(null);
                          }}
                          className={[
                            "flex w-full items-center justify-between px-3 py-2 text-left text-[11px] font-semibold capitalize transition hover:bg-slate-50",
                            (topic.status ?? "draft") === status
                              ? "text-[#1557c0]"
                              : "text-slate-600",
                          ].join(" ")}
                        >
                          {status}
                          {(topic.status ?? "draft") === status ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => onToggleTopic(topic.id)}
                  className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700"
                  title={isOpen ? "Collapse topic" : "Expand topic"}
                  aria-label={isOpen ? "Collapse topic" : "Expand topic"}
                >
                  <ChevronDown
                    className={[
                      "h-3.5 w-3.5 transition",
                      isOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>
              </div>
            </div>

            {isOpen ? (
              <div className="mt-1.5 space-y-1">
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!topic.subtopics[0]}
                    onClick={() => {
                      const subtopic = topic.subtopics[0];
                      if (!subtopic) return;
                      setCreatingLessonForSubtopicId(subtopic.id);
                      setLessonTitle("");
                    }}
                    className="inline-flex h-6 items-center gap-1 rounded-md bg-white px-2 text-[10px] font-semibold text-[#1557c0] ring-1 ring-blue-100 transition hover:bg-[#eaf2ff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3" />
                    Lesson
                  </button>
                </div>
                {topic.subtopics.map((subtopic) => (
                  <div
                    key={subtopic.id}
                    className="rounded-lg bg-slate-50 px-2 py-1.5"
                  >
                    <div className="space-y-0.5">
                      {subtopic.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson)}
                          className={[
                            "flex w-full cursor-pointer items-start gap-2 rounded-lg px-2 py-1 text-left transition",
                            lesson.id === activeLessonId
                              ? "bg-[#eaf2ff] text-[#1557c0]"
                              : "text-slate-600 hover:bg-white",
                          ].join(" ")}
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectLesson(lesson);
                            }}
                            className="pt-0.5"
                            aria-label={`Select ${lesson.title}`}
                          >
                            {lesson.id === activeLessonId ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#1557c0]" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-slate-300" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <InlineEditableTitle
                              ariaLabel="Rename lesson"
                              value={lesson.title}
                              onSave={(title) =>
                                onRenameLesson(lesson.id, title)
                              }
                              className="text-[11px] font-semibold"
                              inputClassName="h-6 w-full text-[11px] font-semibold"
                            />

                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <span>{lesson.scenes.length} scenes</span>
                              <span>•</span>
                              <span className="capitalize">
                                {lesson.status}
                              </span>
                            </div>
                          </div>

                          <div
                            className="flex shrink-0 items-center gap-0.5"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              disabled={lessonIndex === 0}
                              onClick={() =>
                                onMoveLesson(subtopic.id, lesson.id, "up")
                              }
                              className="grid h-5 w-5 place-items-center rounded text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                              title="Move lesson up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>

                            <button
                              type="button"
                              disabled={
                                lessonIndex === subtopic.lessons.length - 1
                              }
                              onClick={() =>
                                onMoveLesson(subtopic.id, lesson.id, "down")
                              }
                              className="grid h-5 w-5 place-items-center rounded text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                              title="Move lesson down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete ${lesson.title}?`)) {
                                  onDeleteLesson(lesson.id);
                                }
                              }}
                              className="grid h-5 w-5 place-items-center rounded text-rose-400 transition hover:bg-white hover:text-rose-700"
                              title="Delete lesson"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>

                            <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                              {lesson.scenes.length}
                            </span>
                          </div>
                        </div>
                      ))}

                      {creatingLessonForSubtopicId === subtopic.id ? (
                        <div className="rounded-lg bg-white p-2 ring-1 ring-blue-200">
                          <input
                            autoFocus
                            value={lessonTitle}
                            onChange={(event) =>
                              setLessonTitle(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                submitLessonCreate(subtopic.id);
                              }

                              if (event.key === "Escape") {
                                cancelLessonCreate();
                              }
                            }}
                            placeholder="Lesson title"
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none transition focus:border-[#1557c0] focus:ring-2 focus:ring-[#1557c0]/10"
                          />

                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelLessonCreate}
                              className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-50"
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() => submitLessonCreate(subtopic.id)}
                              className="rounded-md bg-[#1557c0] px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-[#124aa3]"
                            >
                              Add lesson
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    onSelectAssessmentTarget({
                      type: "topical",
                      topicId: topic.id,
                    })
                  }
                  className="flex w-full items-center gap-2 rounded-lg bg-amber-50 px-2 py-1.5 text-left text-amber-900 ring-1 ring-amber-100 transition hover:bg-amber-100"
                >
                  <FileQuestion className="h-3.5 w-3.5 shrink-0" />

                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">
                      {topic.topicalAssessmentTitle}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {topic.topicalAssessment?.questions.length ?? 0} questions
                    </span>
                  </div>
                </button>
              </div>
            ) : null}
          </section>
        );
      })}

      <button
        type="button"
        onClick={() => onSelectAssessmentTarget({ type: "module" })}
        className="w-full rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-left text-emerald-900 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
      >
        <div className="flex items-center gap-2">
          <FileQuestion className="h-3.5 w-3.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold">
              {draft.moduleAssessmentTitle}
            </span>
            <span className="block text-[10px] text-slate-500">
              {draft.moduleAssessment?.questions.length ?? 0} questions ·{" "}
              {draft.moduleAssessment?.durationMinutes ?? 60}m
            </span>
          </div>
        </div>
      </button>

      {creatingTopic ? (
        <div className="rounded-xl bg-white p-2 ring-1 ring-blue-200">
          <input
            autoFocus
            value={topicTitle}
            onChange={(event) => setTopicTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submitTopicCreate();
              }

              if (event.key === "Escape") {
                cancelTopicCreate();
              }
            }}
            placeholder="Topic title"
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none transition focus:border-[#1557c0] focus:ring-2 focus:ring-[#1557c0]/10"
          />

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelTopicCreate}
              className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>

            <button
              type="button"
              onClick={submitTopicCreate}
              className="rounded-md bg-[#1557c0] px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-[#124aa3]"
            >
              Add topic
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
