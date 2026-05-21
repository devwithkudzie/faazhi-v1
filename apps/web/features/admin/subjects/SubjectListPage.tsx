import Link from "next/link";
import { Plus } from "lucide-react";

import { DraftSubjectsPanel } from "@/features/admin/dashboard/components/DraftSubjectsPanel";
import { PublishedSubjectsPanel } from "@/features/admin/dashboard/components/PublishedSubjectsPanel";
import { AdminShell } from "@/features/admin/shared/components/AdminShell";
import {
  getDraftSubjects,
  getPublishedSubjects,
} from "@/features/admin/subjects/services/subject.service";

export default function SubjectListPage() {
  const draftSubjects = getDraftSubjects();
  const publishedSubjects = getPublishedSubjects();

  return (
    <AdminShell>
      <main className="space-y-6 pb-8">
        <section className="rounded-[32px] bg-white/88 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
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
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1557c0] px-5 text-sm font-semibold text-white no-underline transition hover:bg-[#124cad]"
            >
              <Plus className="h-5 w-5" />
              Create Subject
            </Link>
          </div>
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-2">
          <DraftSubjectsPanel subjects={draftSubjects} />
          <PublishedSubjectsPanel subjects={publishedSubjects} />
        </div>
      </main>
    </AdminShell>
  );
}
