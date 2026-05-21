"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  FileQuestion,
  Plus,
  X,
} from "lucide-react";

import type {
  AdminLessonDraft,
  AdminPaperDraft,
} from "@/features/admin/papers/types/paper-workspace.types";

type MoveDirection = "up" | "down";

export function CurriculumTool({
  activeLessonId,
  draft,
  onSelectLesson,
  onCreateTopic,
  onCreateLesson,
  onMoveTopic,
  onMoveLesson,
}: {
  activeLessonId?: string;
  draft: AdminPaperDraft;
  onSelectLesson: (lesson: AdminLessonDraft) => void;
  onCreateTopic: (title: string) => void;
  onCreateLesson: (subtopicId: string, title: string) => void;
  onMoveTopic: (topicId: string, direction: MoveDirection) => void;
  onMoveLesson: (
    subtopicId: string,
    lessonId: string,
    direction: MoveDirection,
  ) => void;
}) {
  const [openTopicIds, setOpenTopicIds] = useState<string[]>(() =>
    draft.topics.length > 0 ? [draft.topics[0].id] : [],
  );

  const [creatingTopic, setCreatingTopic] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");

  const [creatingLessonForSubtopicId, setCreatingLessonForSubtopicId] =
    useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");

  function toggleTopic(topicId: string) {
    setOpenTopicIds((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId],
    );
  }

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
    <div className="space-y-2">
      <div className="rounded-xl bg-[#eef4ff] px-3 py-2 ring-1 ring-blue-100">
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
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-[#1557c0] px-2 text-[11px] font-semibold text-white transition hover:bg-[#124aa3]"
          >
            <Plus className="h-3.5 w-3.5" />
            Topic
          </button>
        </div>
      </div>

      {draft.topics.map((topic, topicIndex) => {
        const isOpen = openTopicIds.includes(topic.id);

        return (
          <section
            key={topic.id}
            className="rounded-2xl bg-white p-2.5 ring-1 ring-slate-200"
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => toggleTopic(topic.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                )}

                <h3 className="min-w-0 truncate text-sm font-semibold text-slate-900">
                  {topic.title}
                </h3>
              </button>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={topicIndex === 0}
                  onClick={() => onMoveTopic(topic.id, "up")}
                  className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Move topic up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  disabled={topicIndex === draft.topics.length - 1}
                  onClick={() => onMoveTopic(topic.id, "down")}
                  className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Move topic down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  {topic.subtopics.length}
                </span>
              </div>
            </div>

            {isOpen ? (
              <div className="mt-2 space-y-1.5">
                {topic.subtopics.map((subtopic) => (
                  <div
                    key={subtopic.id}
                    className="rounded-xl bg-slate-50 px-2 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#1557c0]" />

                        <p className="truncate text-xs font-semibold text-slate-700">
                          {subtopic.title}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCreatingLessonForSubtopicId(subtopic.id);
                          setLessonTitle("");
                        }}
                        className="inline-flex h-6 items-center gap-1 rounded-md bg-white px-1.5 text-[10px] font-semibold text-[#1557c0] ring-1 ring-blue-100 transition hover:bg-[#eaf2ff]"
                      >
                        <Plus className="h-3 w-3" />
                        Lesson
                      </button>
                    </div>

                    <div className="mt-2 space-y-1">
                      {subtopic.lessons.map((lesson, lessonIndex) => (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => onSelectLesson(lesson)}
                          className={[
                            "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition",
                            lesson.id === activeLessonId
                              ? "bg-[#eaf2ff] text-[#1557c0]"
                              : "text-slate-600 hover:bg-white",
                          ].join(" ")}
                        >
                          <div className="pt-0.5">
                            {lesson.id === activeLessonId ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#1557c0]" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-slate-300" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">
                              {lesson.title}
                            </p>

                            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
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

                            <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                              {lesson.scenes.length}
                            </span>
                          </div>
                        </button>
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

                <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-2 py-2 text-amber-900 ring-1 ring-amber-100">
                  <FileQuestion className="h-3.5 w-3.5 shrink-0" />

                  <span className="truncate text-xs font-semibold">
                    {topic.topicalAssessmentTitle}
                  </span>
                </div>
              </div>
            ) : null}
          </section>
        );
      })}

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