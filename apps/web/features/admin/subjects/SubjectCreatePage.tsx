"use client";

import { useState } from "react";

import { AdminShell } from "@/features/admin/shared/components/AdminShell";
import { StarterTemplatePreview } from "@/features/admin/subjects/components/StarterTemplatePreview";
import { SubjectForm } from "@/features/admin/subjects/components/SubjectForm";
import {
  createSubjectDraft,
  starterTemplate,
} from "@/features/admin/subjects/services/subject.service";
import type { SubjectDraftResult } from "@/features/admin/subjects/types/subject.types";

export default function SubjectCreatePage() {
  const [createdDraft, setCreatedDraft] = useState<SubjectDraftResult | null>(
    null,
  );

  return (
    <AdminShell>
      <main className="space-y-6 pb-8">
        <section className="rounded-[32px] bg-white/88 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
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

        <section className="grid gap-6 rounded-[32px] bg-white/90 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 lg:grid-cols-[1fr_360px]">
          <SubjectForm
            onSubmit={(input) => setCreatedDraft(createSubjectDraft(input))}
          />
          <StarterTemplatePreview
            items={createdDraft?.starterTemplate ?? starterTemplate}
          />
        </section>

        {createdDraft && (
          <section className="rounded-[28px] bg-emerald-50 p-5 text-emerald-950 ring-1 ring-emerald-100">
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
