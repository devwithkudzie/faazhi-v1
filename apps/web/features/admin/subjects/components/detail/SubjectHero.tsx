"use client";

import { useState } from "react";
import { Eye, PencilLine, Rocket, Trash2, X } from "lucide-react";

import type { AdminPaperDraft } from "@/features/admin/papers/types/paper-workspace.types";
import { StudentPreviewModal } from "@/features/admin/studio/components/layout/StudentPreviewModal";
import { PublishStatusBadge } from "@/features/admin/subjects/components/PublishStatusBadge";
import type {
  AdminSubject,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";
import {
  buildAdminDraftFromApi,
  type ApiLesson,
  type ApiLessonDetail,
  type ApiPaper,
  type ApiSubject,
} from "@/features/learn/services/api-curriculum";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";

export function SubjectHero({
  subject,
  onDetailsSave,
  onStatusChange,
  onDelete,
}: {
  subject: AdminSubject;
  onDetailsSave?: (subject: AdminSubject) => void;
  onStatusChange?: (subject: AdminSubject, paperIds?: string[]) => void;
  onDelete?: () => void;
}) {
  const { token } = useAuth();
  const [editDraft, setEditDraft] = useState<AdminSubject | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishPapers, setPublishPapers] = useState<ApiPaper[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPaper, setPreviewPaper] = useState<SubjectPaperSummary | null>(
    null,
  );
  const [previewDraft, setPreviewDraft] = useState<AdminPaperDraft | null>(null);
  const previewLessonId =
    previewDraft?.topics[0]?.subtopics[0]?.lessons[0]?.id ?? "";

  function updateDetails(field: keyof AdminSubject, value: string) {
    setEditDraft((current) => ({
      ...(current ?? subject),
      [field]: value,
    }));
  }

  const modalDraft = editDraft ?? subject;

  async function openPublishFlow() {
    if (subject.status === "published") {
      onStatusChange?.(subject);
      return;
    }

    setPublishError(null);
    setPublishOpen(true);

    if (!token) return;

    const result = await apiRequest<{ papers: ApiPaper[] }>(
      `/api/subjects/${subject.id}/papers`,
      { token },
    );
    setPublishPapers(result.papers);
    setSelectedPaperIds(
      result.papers
        .filter((paper) => paper.status === "published")
        .map((paper) => paper.id),
    );
  }

  function toggleSelectedPaper(paperId: string) {
    setSelectedPaperIds((current) =>
      current.includes(paperId)
        ? current.filter((id) => id !== paperId)
        : [...current, paperId],
    );
  }

  function submitPublish() {
    if (selectedPaperIds.length === 0) {
      setPublishError("Select at least one paper/module to publish.");
      return;
    }

    onStatusChange?.(subject, selectedPaperIds);
    setPublishOpen(false);
  }

  async function openPreview() {
    if (!token) return;

    const [subjectResult, paperResult] = await Promise.all([
      apiRequest<{ subject: ApiSubject }>(`/api/subjects/${subject.id}`, {
        token,
      }),
      apiRequest<{ papers: ApiPaper[] }>(`/api/subjects/${subject.id}/papers`, {
        token,
      }),
    ]);
    const paper = paperResult.papers[0];
    if (!paper) return;

    const lessonResult = await apiRequest<{ lessons: ApiLesson[] }>(
      `/api/papers/${paper.id}/lessons`,
      { token },
    );
    const lessonDetails = await Promise.all(
      lessonResult.lessons.map((lesson) =>
        apiRequest<ApiLessonDetail>(`/api/lessons/${lesson.id}`, { token }),
      ),
    );
    setPreviewPaper({
      id: paper.id,
      title: paper.title,
      status: paper.status,
      topics: 0,
      scenes: 0,
      completionRate: 0,
    });
    setPreviewDraft(
      buildAdminDraftFromApi({
        lessonDetails,
        paper,
        subject: subjectResult.subject,
      }),
    );
    setPreviewOpen(true);
  }

  return (
    <>
      <section className="bg-white/88 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#1557c0]">
                {subject.code}
              </p>
              <PublishStatusBadge status={subject.status} />
            </div>
            <div className="mt-2 flex items-start gap-3">
              <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
                {subject.name}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditDraft(subject);
                  setEditOpen(true);
                }}
                className="mt-1 grid h-9 w-9 shrink-0 place-items-center bg-[#edf5ff] text-[#1557c0] transition hover:bg-[#dbeafe]"
                aria-label="Edit subject details"
                title="Edit subject details"
              >
                <PencilLine className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {subject.level}
            </p>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {subject.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void openPreview()}
              className="inline-flex h-12 items-center justify-center gap-2 bg-[#edf5ff] px-5 text-sm font-semibold text-[#1557c0] transition hover:bg-[#dbeafe] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye className="h-5 w-5" />
              Preview
            </button>
            <button
              type="button"
              onClick={() => void openPublishFlow()}
              className={[
                "inline-flex h-12 items-center justify-center gap-2 px-5 text-sm font-semibold text-white transition",
                subject.status === "published"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700",
              ].join(" ")}
            >
              <Rocket className="h-5 w-5" />
              {subject.status === "published" ? "Unpublish" : "Publish"}
            </button>
            {subject.status !== "published" ? (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex h-12 items-center justify-center gap-2 bg-rose-50 px-5 text-sm font-semibold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100"
              >
                <Trash2 className="h-5 w-5" />
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {editOpen ? (
        <div className="fixed inset-0 z-[9999] bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-12 max-w-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#1557c0]">
                  Subject details
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                  Edit subject
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="grid h-10 w-10 place-items-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close subject details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Subject name
                </span>
                <input
                  value={modalDraft.name}
                  onChange={(event) => updateDetails("name", event.target.value)}
                  className="mt-1 w-full border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Code
                </span>
                <input
                  value={modalDraft.code}
                  onChange={(event) => updateDetails("code", event.target.value)}
                  className="mt-1 w-full border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0]"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold text-slate-600">
                  Level
                </span>
                <select
                  value={modalDraft.level}
                  onChange={(event) => updateDetails("level", event.target.value)}
                  className="mt-1 w-full border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0]"
                >
                  <option value="A Level">A Level</option>
                  <option value="IGCSE">IGCSE</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold text-slate-600">
                  Description
                </span>
                <textarea
                  value={modalDraft.description}
                  onChange={(event) =>
                    updateDetails("description", event.target.value)
                  }
                  rows={4}
                  className="mt-1 w-full resize-none border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0]"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onDetailsSave?.(modalDraft);
                  setEditOpen(false);
                }}
                className="h-10 bg-[#1557c0] px-5 text-sm font-semibold text-white transition hover:bg-[#124aa3]"
              >
                Save details
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {publishOpen ? (
        <div className="fixed inset-0 z-[9999] bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-12 max-w-xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#1557c0]">
                  Publish subject
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                  Select papers/modules
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  A subject needs at least one published paper before students
                  can see it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPublishOpen(false)}
                className="grid h-10 w-10 place-items-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close publish menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {publishPapers.map((paper) => (
                <label
                  key={paper.id}
                  className="flex cursor-pointer items-center justify-between gap-3 bg-slate-50 px-3 py-3 ring-1 ring-slate-200"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-950">
                      {paper.title}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {paper.status === "published"
                        ? "Already published"
                        : "Draft module"}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedPaperIds.includes(paper.id)}
                    onChange={() => toggleSelectedPaper(paper.id)}
                    className="h-4 w-4 accent-[#1557c0]"
                  />
                </label>
              ))}
            </div>

            {publishError ? (
              <p className="mt-4 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
                {publishError}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPublishOpen(false)}
                className="h-10 bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitPublish}
                className="h-10 bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Publish selected
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewPaper && previewDraft ? (
        <StudentPreviewModal
          activeLessonId={previewLessonId}
          draft={previewDraft}
          onClose={() => setPreviewOpen(false)}
          open={previewOpen}
          paper={previewPaper}
          subject={subject}
        />
      ) : null}
    </>
  );
}
