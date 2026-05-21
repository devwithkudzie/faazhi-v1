import Link from "next/link";
import { ArrowLeft, Eye, Save } from "lucide-react";

import { PublishStatusBadge } from "@/features/admin/subjects/components/PublishStatusBadge";
import type {
  AdminSubject,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";

export function PaperWorkspaceHero({
  subject,
  paper,
}: {
  subject: AdminSubject;
  paper: SubjectPaperSummary;
}) {
  return (
    <section className="rounded-[32px] bg-white/88 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href={`/admin/subjects/${subject.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1557c0] no-underline hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to subject
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#1557c0]">
              {subject.code} · {paper.title}
            </p>
            <PublishStatusBadge status={paper.status} />
          </div>

          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            Paper lesson workspace
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Create and organize lessons, scenes, embedded checkpoints, topical
            assessments, and the module assessment for this paper.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/subjects/${subject.id}/learn/${paper.id}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#edf5ff] px-5 text-sm font-semibold text-[#1557c0] no-underline transition hover:bg-[#dbeafe]"
          >
            <Eye className="h-5 w-5" />
            Student preview
          </Link>
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1557c0] px-5 text-sm font-semibold text-white transition hover:bg-[#124cad]">
            <Save className="h-5 w-5" />
            Save paper draft
          </button>
        </div>
      </div>
    </section>
  );
}
