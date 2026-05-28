"use client";

import Link from "next/link";
import { ArrowRight, Eye, PencilLine, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { AdminPaperDraft } from "@/features/admin/papers/types/paper-workspace.types";
import {
  getPaperDurationMinutes,
  getPaperReadiness,
} from "@/features/admin/papers/services/paper-workspace.service";
import { StudentPreviewModal } from "@/features/admin/studio/components/layout/StudentPreviewModal";
import { PublishStatusBadge } from "@/features/admin/subjects/components/PublishStatusBadge";
import type { AdminSubject, SubjectPaperSummary } from "@/features/admin/subjects/types/subject.types";
import {
  buildAdminDraftFromApi,
  type ApiLessonDetail,
  type ApiSubject,
} from "@/features/learn/services/api-curriculum";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";

interface ApiPaper {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: "draft" | "published" | "archived";
  order: number;
}

interface ApiLesson {
  id: string;
  paperId: string;
  title: string;
  description: string;
  status: "draft" | "published";
  estimatedMinutes: number;
}

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "Not estimated";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m contact time`;
  return `${hours}h ${mins}m contact time`;
}

function getSavedDraft(subjectId: string, paperId: string) {
  if (typeof window === "undefined") return null;

  const saved =
    window.localStorage.getItem(`faazhi.workspace.${subjectId}.${paperId}`) ??
    window.localStorage.getItem(
      `faazhi.admin.paper-draft.${subjectId}.${paperId}`,
    );
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as { draft?: AdminPaperDraft } | AdminPaperDraft;
    if ("draft" in parsed && parsed.draft) return parsed.draft;
    return "subjectId" in parsed ? parsed : null;
  } catch {
    return null;
  }
}

function getDraftContactMinutes(draft: AdminPaperDraft | null) {
  return draft ? getPaperDurationMinutes(draft) : 0;
}

export function SubjectPapersPanel({ subject }: { subject: AdminSubject }) {
  const { token } = useAuth();
  const [papers, setPapers] = useState<ApiPaper[]>([]);
  const [lessonsByPaper, setLessonsByPaper] = useState<Record<string, ApiLesson[]>>({});
  const [newPaperTitle, setNewPaperTitle] = useState("");
  const [previewPaper, setPreviewPaper] = useState<SubjectPaperSummary | null>(null);
  const [previewDraft, setPreviewDraft] = useState<AdminPaperDraft | null>(null);
  const previewLessonId =
    previewDraft?.topics[0]?.subtopics[0]?.lessons[0]?.id ?? "";

  async function loadPapers() {
    if (!token) return;

    const paperResult = await apiRequest<{ papers: ApiPaper[] }>(
      `/api/subjects/${subject.id}/papers`,
      { token },
    );
    setPapers(paperResult.papers);

    const lessonEntries = await Promise.all(
      paperResult.papers.map(async (paper) => {
        const lessonResult = await apiRequest<{ lessons: ApiLesson[] }>(
          `/api/papers/${paper.id}/lessons`,
          { token },
        );
        return [paper.id, lessonResult.lessons] as const;
      }),
    );
    setLessonsByPaper(Object.fromEntries(lessonEntries));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token) return;
      const paperResult = await apiRequest<{ papers: ApiPaper[] }>(
        `/api/subjects/${subject.id}/papers`,
        { token },
      );

      const lessonEntries = await Promise.all(
        paperResult.papers.map(async (paper) => {
          const lessonResult = await apiRequest<{ lessons: ApiLesson[] }>(
            `/api/papers/${paper.id}/lessons`,
            { token },
          );
          return [paper.id, lessonResult.lessons] as const;
        }),
      );

      if (!cancelled) {
        setPapers(paperResult.papers);
        setLessonsByPaper(Object.fromEntries(lessonEntries));
      }
    }

    load().catch(() => {
      if (!cancelled) {
        setPapers([]);
        setLessonsByPaper({});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [subject.id, token]);

  async function createPaper() {
    if (!token || !newPaperTitle.trim()) return;

    await apiRequest(`/api/subjects/${subject.id}/papers`, {
      method: "POST",
      token,
      body: JSON.stringify({ title: newPaperTitle.trim() }),
    });
    setNewPaperTitle("");
    await loadPapers();
  }

  async function updatePaperStatus(paper: ApiPaper) {
    if (!token) return;

    if (paper.status === "published") {
      await apiRequest(`/api/papers/${paper.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "draft" }),
      });
    } else {
      await apiRequest(`/api/papers/${paper.id}/publish`, {
        method: "POST",
        token,
      });
    }
    await loadPapers();
  }

  async function deletePaper(paper: ApiPaper) {
    if (!token) return;
    if (!window.confirm(`Delete ${paper.title} and all lessons inside it?`)) return;

    await apiRequest(`/api/papers/${paper.id}`, {
      method: "DELETE",
      token,
    });
    await loadPapers();
  }

  const toSummary = (paper: ApiPaper): SubjectPaperSummary => ({
    id: paper.id,
    title: paper.title,
    status: paper.status,
    topics: 0,
    scenes: 0,
    completionRate: 0,
  });

  async function openPreview(paper: ApiPaper) {
    if (!token) return;

    const [subjectResult, lessonResult] = await Promise.all([
      apiRequest<{ subject: ApiSubject }>(`/api/subjects/${subject.id}`, {
        token,
      }),
      apiRequest<{ lessons: ApiLesson[] }>(`/api/papers/${paper.id}/lessons`, {
        token,
      }),
    ]);
    const lessonDetails = await Promise.all(
      lessonResult.lessons.map((lesson) =>
        apiRequest<ApiLessonDetail>(`/api/lessons/${lesson.id}`, { token }),
      ),
    );
    setPreviewPaper(toSummary(paper));
    setPreviewDraft(
      buildAdminDraftFromApi({
        lessonDetails,
        paper,
        subject: subjectResult.subject,
      }),
    );
  }

  return (
    <>
      <section className="bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Papers and lessons
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Create papers here. Open a paper workspace to create lessons and
              scenes inside that paper.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              value={newPaperTitle}
              onChange={(event) => setNewPaperTitle(event.target.value)}
              placeholder="Paper 1"
              className="h-10 border border-slate-200 px-3 text-sm outline-none focus:border-[#1557c0]"
            />
            <button
              type="button"
              onClick={() => void createPaper()}
              className="inline-flex h-10 items-center gap-2 bg-[#1557c0] px-4 text-sm font-semibold text-white hover:bg-[#124aa3]"
            >
              <Plus className="h-4 w-4" />
              Add paper
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {papers.map((paper) => {
            const lessons = lessonsByPaper[paper.id] ?? [];
            const savedDraft = getSavedDraft(subject.id, paper.id);
            const topicCount = savedDraft?.topics.length ?? lessons.length;
            const savedContactMinutes = getDraftContactMinutes(savedDraft);
            const contactMinutes = savedContactMinutes
              ? savedContactMinutes
              : lessons.reduce(
                  (total, lesson) => total + lesson.estimatedMinutes,
                  0,
                );
            const readiness = savedDraft
              ? getPaperReadiness(savedDraft)
              : {
                  topicCount,
                  lessonCount: lessons.length,
                  sceneCount: lessons.length,
                  ready: lessons.length > 0,
                };
            const isReady = readiness.ready;
            const visibility =
              paper.status === "published" && subject.status === "published"
                ? "Visible to students"
                : paper.status === "published"
                  ? "Staged until subject is published"
                  : "Unpublished draft";

            return (
            <div
              key={paper.id}
              className={[
                "bg-slate-50 p-4 ring-1",
                isReady ? "ring-slate-200/70" : "ring-amber-200",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-slate-950">
                    {savedDraft?.paperMeta?.title ?? paper.title}
                    </h4>
                    <PublishStatusBadge status={paper.status} />
                    <span
                      className={[
                        "px-2 py-1 text-xs font-bold",
                        isReady
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
                      ].join(" ")}
                    >
                      {isReady ? "Ready to publish" : "Needs lesson content"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {topicCount} main topics · {formatMinutes(contactMinutes)} · {visibility}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {savedDraft?.paperMeta?.description ||
                      paper.description ||
                      "Add paper details in the workspace."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void updatePaperStatus(paper)}
                  className="bg-white px-3 py-2 text-xs font-bold text-[#1557c0] ring-1 ring-blue-100 hover:bg-[#edf5ff]"
                >
                  {paper.status === "published" ? "Unpublish paper" : "Publish paper"}
                </button>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(savedDraft?.topics ?? []).map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-white px-3 py-2 text-sm ring-1 ring-slate-200"
                  >
                    <p className="font-semibold text-slate-900">{topic.title}</p>
                    <p className="text-xs text-slate-500">
                      {topic.status ?? "draft"} · {topic.subtopics.length} subtopics
                    </p>
                  </div>
                ))}
                {!savedDraft?.topics.length ? (
                  <p className="bg-white px-3 py-2 text-sm text-slate-500 ring-1 ring-slate-200">
                    Open the workspace to shape this paper&apos;s main topics.
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/admin/subjects/${subject.id}/papers/${paper.id}/learn`}
                  className="inline-flex h-10 items-center justify-center gap-2 bg-[#1557c0] px-4 text-sm font-semibold text-white no-underline transition hover:bg-[#124cad]"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit paper workspace
                </Link>
                <button
                  type="button"
                  onClick={() => void openPreview(paper)}
                  className="inline-flex h-10 items-center justify-center gap-2 bg-[#edf5ff] px-4 text-sm font-semibold text-[#1557c0] transition hover:bg-[#dbeafe]"
                >
                  <Eye className="h-4 w-4" />
                  Student preview
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void deletePaper(paper)}
                  className="inline-flex h-10 items-center justify-center gap-2 bg-rose-50 px-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete paper
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {previewPaper && previewDraft ? (
        <StudentPreviewModal
          activeLessonId={previewLessonId}
          draft={previewDraft}
          onClose={() => {
            setPreviewPaper(null);
            setPreviewDraft(null);
          }}
          open={Boolean(previewPaper)}
          paper={previewPaper}
          subject={subject}
        />
      ) : null}
    </>
  );
}
