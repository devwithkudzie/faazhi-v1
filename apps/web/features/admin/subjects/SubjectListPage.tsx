"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { DraftSubjectsPanel } from "@/features/admin/dashboard/components/DraftSubjectsPanel";
import { PublishedSubjectsPanel } from "@/features/admin/dashboard/components/PublishedSubjectsPanel";
import { AdminShell } from "@/features/admin/shared/components/AdminShell";
import {
  mapApiSubject,
  type ApiSubject,
} from "@/features/admin/subjects/services/api-subjects";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";

export default function SubjectListPage() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    apiRequest<{ subjects: ApiSubject[] }>("/api/subjects", { token })
      .then((result) => {
        if (!cancelled) setSubjects(result.subjects);
      })
      .catch(() => {
        if (!cancelled) setSubjects([]);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function updateSubjectStatus(subjectId: string, status: "draft" | "published") {
    if (!token) return;

    await apiRequest(`/api/subjects/${subjectId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
    const result = await apiRequest<{ subjects: ApiSubject[] }>("/api/subjects", {
      token,
    });
    setSubjects(result.subjects);
  }

  const adminSubjects = subjects.map(mapApiSubject);
  const draftSubjects = adminSubjects.filter((subject) => subject.status === "draft");
  const publishedSubjects = adminSubjects.filter((subject) => subject.status === "published");

  return (
    <AdminShell>
      <main className="space-y-6 pb-8">
        <section className="bg-white/88 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1557c0]">
                Content management
              </p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                Subjects
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Subjects are the top-level content workspaces. Drafts stay
                hidden from students until an admin publishes them.
              </p>
            </div>

            <Link
              href="/admin/subjects/new"
              className="inline-flex h-12 items-center justify-center gap-2 bg-[#1557c0] px-5 text-sm font-semibold text-white no-underline transition hover:bg-[#124cad]"
            >
              <Plus className="h-5 w-5" />
              Create Subject
            </Link>
          </div>
        </section>

        <div className="space-y-6">
          <DraftSubjectsPanel
            subjects={draftSubjects}
            onStatusChange={(subject) =>
              void updateSubjectStatus(subject.id, "published")
            }
          />
          <PublishedSubjectsPanel
            subjects={publishedSubjects}
            onStatusChange={(subject) =>
              void updateSubjectStatus(subject.id, "draft")
            }
          />
        </div>
      </main>
    </AdminShell>
  );
}
