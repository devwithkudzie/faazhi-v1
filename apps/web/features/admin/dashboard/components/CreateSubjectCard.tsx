"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { Button } from "@/shared/ui/button";

export function CreateSubjectCard() {
  const router = useRouter();
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
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
          papers: [],
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
    <>
      <section className="bg-[#1557c0] p-6 text-white shadow-[0_26px_80px_rgba(21,87,192,0.24)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-white/70">
              Content management
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Create or continue a subject workspace.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Keep content production close to the launch goal: build lessons,
              preview them, and publish when they are ready for students.
            </p>
          </div>

          <Button
            onClick={() => setOpen(true)}
            className="h-12 bg-white px-5 text-[#1557c0] hover:bg-blue-50"
          >
            <Plus className="h-5 w-5" />
            Create Subject
          </Button>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-8 max-w-4xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#1557c0]">
                  Create subject
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                  New draft subject
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  This creates starter draft content. Students will not see it
                  until the subject is published.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close create subject dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <SubjectForm
                disabled={saving}
                onSubmit={(input) => void createSubject(input)}
                submitLabel={saving ? "Creating..." : "Create subject draft"}
              />
              <StarterTemplatePreview
                items={createdDraft?.starterTemplate ?? starterTemplate}
              />
            </div>

            {error ? (
              <div className="mt-5 bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
                {error}
              </div>
            ) : null}

            {createdDraft && (
              <div className="mt-5 bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-100">
                <strong>{createdDraft.subject.name}</strong> draft created.
                Next step: open the subject editor, review the draft lessons,
                then publish when it is ready for students.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
