"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { StarterTemplatePreview } from "@/features/admin/subjects/components/StarterTemplatePreview";
import { SubjectForm } from "@/features/admin/subjects/components/SubjectForm";
import {
  createSubjectDraft,
  starterTemplate,
} from "@/features/admin/subjects/services/subject.service";
import type { SubjectDraftResult } from "@/features/admin/subjects/types/subject.types";
import { Button } from "@/shared/ui/button";

export function CreateSubjectCard() {
  const [open, setOpen] = useState(false);
  const [createdDraft, setCreatedDraft] = useState<SubjectDraftResult | null>(
    null,
  );

  return (
    <>
      <section className="rounded-[32px] bg-[#1557c0] p-6 text-white shadow-[0_26px_80px_rgba(21,87,192,0.24)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-white/70">
              Content management
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Create one subject, then manage everything inside it.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Faazhi creates a draft subject with a starter paper, topic,
              subtopic, and welcome scene so the admin begins from a structured
              workspace.
            </p>
          </div>

          <Button
            onClick={() => setOpen(true)}
            className="h-12 rounded-2xl bg-white px-5 text-[#1557c0] hover:bg-blue-50"
          >
            <Plus className="h-5 w-5" />
            Create Subject
          </Button>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-8 max-w-4xl rounded-[32px] bg-white p-6 shadow-2xl">
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
                className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close create subject dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <SubjectForm
                onSubmit={(input) => setCreatedDraft(createSubjectDraft(input))}
              />
              <StarterTemplatePreview
                items={createdDraft?.starterTemplate ?? starterTemplate}
              />
            </div>

            {createdDraft && (
              <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-100">
                <strong>{createdDraft.subject.name}</strong> draft created.
                Next step: open the subject editor, review the starter template,
                then publish when it is ready for students.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
