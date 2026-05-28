"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "@/features/admin/shared/components/AdminShell";
import { SubjectHero } from "@/features/admin/subjects/components/detail/SubjectHero";
import { SubjectPapersPanel } from "@/features/admin/subjects/components/detail/SubjectPapersPanel";
import { SubjectStats } from "@/features/admin/subjects/components/detail/SubjectStats";
import {
  mapApiSubject,
  type ApiSubject,
} from "@/features/admin/subjects/services/api-subjects";
import type { AdminSubject } from "@/features/admin/subjects/types/subject.types";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";

export default function SubjectEditorPage({
  subjectId,
}: {
  subjectId: string;
}) {
  const { token } = useAuth();
  const [subject, setSubject] = useState<AdminSubject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    apiRequest<{ subject: ApiSubject }>(`/api/subjects/${subjectId}`, {
      token,
    })
      .then((result) => {
        if (!cancelled) setSubject(mapApiSubject(result.subject));
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Subject not found.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [subjectId, token]);

  async function updateSubject(nextSubject: AdminSubject) {
    if (!token) return;

    const result = await apiRequest<{ subject: ApiSubject }>(
      `/api/subjects/${subjectId}`,
      {
        method: "PATCH",
        token,
        body: JSON.stringify({
          name: nextSubject.name,
          code: nextSubject.code,
          description: nextSubject.description,
          level: nextSubject.level === "IGCSE" ? "igcse" : "a-level",
        }),
      },
    );
    setSubject(mapApiSubject(result.subject));
  }

  async function togglePublish(nextSubject: AdminSubject, paperIds?: string[]) {
    if (!token) return;

    try {
      const result =
        nextSubject.status === "published"
          ? await apiRequest<{ subject: ApiSubject }>(`/api/subjects/${subjectId}`, {
              method: "PATCH",
              token,
              body: JSON.stringify({ status: "draft" }),
            })
          : await apiRequest<{ subject: ApiSubject }>(
              `/api/subjects/${subjectId}/publish`,
              {
                method: "POST",
                token,
                body: JSON.stringify({ paperIds: paperIds ?? [] }),
              },
            );
      setSubject(mapApiSubject(result.subject));
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update publish status.",
      );
    }
  }

  async function deleteSubject() {
    if (!token || !subject) return;

    const confirmed = window.confirm(
      `Delete ${subject.name}? This removes its papers, lessons, scenes, narration, progress, and subscriptions. This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/api/subjects/${subjectId}`, {
        method: "DELETE",
        token,
      });
      window.location.href = "/admin/subjects";
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete subject.",
      );
    }
  }

  return (
    <AdminShell>
      <main className="space-y-6 pb-8">
        {error ? (
          <section className="bg-rose-50 p-5 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
            {error}
          </section>
        ) : null}

        {subject ? (
          <>
            <SubjectHero
              subject={subject}
              onDetailsSave={(nextSubject) => void updateSubject(nextSubject)}
              onStatusChange={(nextSubject, paperIds) =>
                void togglePublish(nextSubject, paperIds)
              }
              onDelete={() => void deleteSubject()}
            />
            <SubjectStats subject={subject} />

            <SubjectPapersPanel subject={subject} />
          </>
        ) : null}
      </main>
    </AdminShell>
  );
}
