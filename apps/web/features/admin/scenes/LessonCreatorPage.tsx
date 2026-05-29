"use client";

import { useEffect, useState } from "react";

import LessonStudioPage from "@/features/admin/studio/LessonStudioPage";
import type {
  AdminPaperDraft,
} from "@/features/admin/papers/types/paper-workspace.types";
import {
  buildAdminDraftFromApi,
  type ApiLesson,
  type ApiLessonDetail,
  type ApiPaper,
  type ApiSubject,
} from "@/features/learn/services/api-curriculum";
import type {
  AdminSubject,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";

function toAdminSubject(subject: ApiSubject): AdminSubject {
  return {
    id: subject.id,
    code: subject.code,
    name: subject.name,
    description: subject.description,
    status: subject.status,
    updatedAt: "Now",
    level: subject.level === "igcse" ? "IGCSE" : "A Level",
    studentCount: 0,
    completionRate: 0,
    lessons: 0,
    assessments: 0,
    averageScore: 0,
    papers: [],
    starterTemplate: [],
  };
}

function toPaperSummary(paper: ApiPaper): SubjectPaperSummary {
  return {
    id: paper.id,
    title: paper.title,
    status: paper.status,
    topics: 0,
    scenes: 0,
    completionRate: 0,
  };
}

export default function LessonCreatorPage({
  subjectId,
  paperId = "paper-1",
}: {
  subjectId: string;
  paperId?: string;
}) {
  const { hydrated, token } = useAuth();
  const [subject, setSubject] = useState<AdminSubject | null>(null);
  const [paper, setPaper] = useState<SubjectPaperSummary | null>(null);
  const [draft, setDraft] = useState<AdminPaperDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) return;

    let cancelled = false;

    async function loadWorkspace() {
      setError(null);

      const [subjectResult, paperResult] = await Promise.all([
        apiRequest<{ subject: ApiSubject }>(`/api/subjects/${subjectId}`, {
          token,
        }),
        apiRequest<{ papers: ApiPaper[] }>(`/api/subjects/${subjectId}/papers`, {
          token,
        }),
      ]);
      const selectedPaper =
        paperResult.papers.find((item) => item.id === paperId) ??
        paperResult.papers[0] ??
        null;

      if (!selectedPaper) {
        throw new Error("No paper exists for this subject yet.");
      }

      const lessonResult = selectedPaper
        ? await apiRequest<{ lessons: ApiLesson[] }>(
            `/api/papers/${selectedPaper.id}/lessons`,
            { token },
          )
        : { lessons: [] };
      const lessonDetails = await Promise.all(
        lessonResult.lessons.map((lesson) =>
          apiRequest<ApiLessonDetail>(`/api/lessons/${lesson.id}`, { token }),
        ),
      );
      const workspaceResult = selectedPaper
        ? await apiRequest<{ workspace: AdminPaperDraft | null }>(
            `/api/papers/${selectedPaper.id}/workspace`,
            { token },
          )
        : { workspace: null };
      const apiDraft = selectedPaper
        ? buildAdminDraftFromApi({
            lessonDetails,
            paper: selectedPaper,
            subject: subjectResult.subject,
          })
        : null;

      if (!apiDraft) {
        throw new Error("Could not build this paper workspace.");
      }

      const savedWorkspace =
        workspaceResult.workspace?.paperId === selectedPaper?.id &&
        workspaceResult.workspace?.subjectId === subjectId
          ? workspaceResult.workspace
          : null;

      if (!cancelled) {
        setSubject(toAdminSubject(subjectResult.subject));
        setPaper(selectedPaper ? toPaperSummary(selectedPaper) : null);
        setDraft(savedWorkspace ?? apiDraft);
      }
    }

    loadWorkspace().catch((loadError) => {
      if (!cancelled) {
        setSubject(null);
        setPaper(null);
        setDraft(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load this paper workspace.",
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hydrated, paperId, subjectId, token]);

  const visibleError =
    error ?? (hydrated && !token ? "Sign in to load this paper workspace." : null);

  if (visibleError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-2xl border border-rose-100 bg-white p-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-rose-700">
            Could not load paper workspace
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {visibleError}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-[#1557c0] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#124cad]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!subject || !paper || !draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-500">
        Loading paper workspace...
      </div>
    );
  }

  return (
    <LessonStudioPage
      key={`${subject.id}:${paper.id}:${draft.updatedAt}`}
      initialDraft={draft}
      paper={paper}
      subject={subject}
    />
  );
}
