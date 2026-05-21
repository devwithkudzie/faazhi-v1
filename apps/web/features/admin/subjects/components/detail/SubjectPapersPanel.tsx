import Link from "next/link";
import { ArrowRight, PencilLine } from "lucide-react";

import { PublishStatusBadge } from "@/features/admin/subjects/components/PublishStatusBadge";
import type { AdminSubject } from "@/features/admin/subjects/types/subject.types";

export function SubjectPapersPanel({ subject }: { subject: AdminSubject }) {
  return (
    <section className="rounded-[28px] bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-950">
          Papers and modules
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Open a paper workspace to create lessons, scenes, topical
          assessments, and module assessments in the correct paper context.
        </p>
      </div>

      <div className="space-y-3">
        {subject.papers.map((paper) => (
          <div
            key={paper.id}
            className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200/70"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-semibold text-slate-950">
                    {paper.title}
                  </h4>
                  <PublishStatusBadge status={paper.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {paper.topics} topics · {paper.scenes} scenes
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1557c0]">
                  {paper.completionRate}%
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  completion
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#1557c0]"
                style={{ width: `${paper.completionRate}%` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/admin/subjects/${subject.id}/papers/${paper.id}/learn`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[#1557c0] px-4 text-sm font-semibold text-white no-underline transition hover:bg-[#124cad]"
              >
                <PencilLine className="h-4 w-4" />
                Edit paper workspace
              </Link>
              <Link
                href={`/subjects/${subject.id}/learn/${paper.id}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[#edf5ff] px-4 text-sm font-semibold text-[#1557c0] no-underline transition hover:bg-[#dbeafe]"
              >
                Student preview
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
