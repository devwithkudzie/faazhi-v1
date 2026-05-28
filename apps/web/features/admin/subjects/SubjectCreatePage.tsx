"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AdminShell } from "@/features/admin/shared/components/AdminShell";
import { StarterTemplatePreview } from "@/features/admin/subjects/components/StarterTemplatePreview";
import { SubjectForm } from "@/features/admin/subjects/components/SubjectForm";
import {
  starterTemplate,
} from "@/features/admin/subjects/services/subject.service";
import type { ApiSubject } from "@/features/admin/subjects/services/api-subjects";
import type {
  SubjectDraftResult,
  SubjectFormInput,
} from "@/features/admin/subjects/types/subject.types";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";

export default function SubjectCreatePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [createdDraft, setCreatedDraft] = useState<SubjectDraftResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function createSubject(input: SubjectFormInput) {
    if (!token) {
      setError("Your admin session is not ready. Please sign in again.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const result = await apiRequest<{ subject: ApiSubject }>("/api/subjects", {
        method: "POST",
        token,
        body: JSON.stringify({
          code: input.code,
          name: input.name,
          description: input.description,
          level: input.level === "IGCSE" ? "igcse" : "a-level",
        }),
      });

      setCreatedDraft({
        subject: {
          id: result.subject.id,
          name: result.subject.name,
          code: result.subject.code,
          level: input.level,
          description: result.subject.description,
          status: result.subject.status,
          updatedAt: "Created just now",
          studentCount: 0,
          completionRate: 0,
          lessons: 0,
          assessments: 0,
          averageScore: 0,
          papers: [
            {
              id: "paper-1",
              title: "Paper 1",
              status: result.subject.status,
              topics: 0,
              scenes: 0,
              completionRate: 0,
            },
          ],
          starterTemplate,
        },
        starterTemplate,
      });
      router.push(`/admin/subjects/${result.subject.id}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not create subject.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <main className="space-y-6 pb-8">
        <section className="bg-white/88 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
          <p className="text-sm font-semibold text-[#1557c0]">
            Create subject
          </p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            New draft subject
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Add the subject details once. Faazhi will create a starter draft
            paper, topic, subtopic, and scene so the editor has a sensible
            first structure.
          </p>
        </section>

        <section className="grid gap-6 bg-white/90 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 lg:grid-cols-[1fr_360px]">
          <SubjectForm
            onSubmit={(input) => void createSubject(input)}
            disabled={saving}
            submitLabel={saving ? "Creating..." : "Create subject draft"}
          />
          <StarterTemplatePreview
            items={createdDraft?.starterTemplate ?? starterTemplate}
          />
        </section>

        {error ? (
          <section className="bg-rose-50 p-5 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
            {error}
          </section>
        ) : null}

        {createdDraft && (
          <section className="bg-emerald-50 p-5 text-emerald-950 ring-1 ring-emerald-100">
            <h3 className="text-lg font-semibold">
              {createdDraft.subject.name} draft created
            </h3>
            <p className="mt-2 text-sm leading-6">
              The subject is still hidden from students. Next, open the subject
              editor to manage papers, topics, subtopics, scenes, preview as a
              student, and publish when ready.
            </p>
          </section>
        )}
      </main>
    </AdminShell>
  );
}
