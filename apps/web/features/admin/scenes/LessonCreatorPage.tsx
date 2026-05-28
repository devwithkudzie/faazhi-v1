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
  const { token } = useAuth();
  const [subject, setSubject] = useState<AdminSubject | null>(null);
  const [paper, setPaper] = useState<SubjectPaperSummary | null>(null);
  const [draft, setDraft] = useState<AdminPaperDraft | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadWorkspace() {
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

    loadWorkspace().catch(() => {
      if (!cancelled) {
        setSubject(null);
        setPaper(null);
        setDraft(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [paperId, subjectId, token]);

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
