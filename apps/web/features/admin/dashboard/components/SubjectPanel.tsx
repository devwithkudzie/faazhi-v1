import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PublishStatusBadge } from "@/features/admin/subjects/components/PublishStatusBadge";
import type { AdminSubject } from "@/features/admin/subjects/types/subject.types";

export function SubjectPanel({
  title,
  description,
  subjects,
  onStatusChange,
}: {
  title: string;
  description: string;
  subjects: AdminSubject[];
  onStatusChange?: (subject: AdminSubject) => void;
}) {
  return (
    <section className="bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <span className="bg-[#eaf2ff] px-3 py-1 text-xs font-bold text-[#1557c0]">
          {subjects.length}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="group bg-slate-50 p-4 ring-1 ring-slate-200/70 transition hover:bg-[#f5f9ff] hover:ring-blue-100"
          >
            <Link
              href={`/admin/subjects/${subject.id}`}
              className="block no-underline"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold text-[#1557c0]">
                      {subject.code}
                    </p>
                    <PublishStatusBadge status={subject.status} />
                  </div>
                  <h3 className="mt-2 truncate text-lg font-semibold text-slate-950">
                    {subject.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {subject.level}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#1557c0]" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-3">
                  <p className="text-xs font-semibold text-slate-400">
                    Students
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {subject.studentCount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-3">
                  <p className="text-xs font-semibold text-slate-400">
                    Completion
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {subject.completionRate}%
                  </p>
                </div>
              </div>
            </Link>

            {onStatusChange ? (
              <button
                type="button"
                onClick={() => onStatusChange(subject)}
                className={[
                  "mt-4 h-9 w-full px-3 text-sm font-semibold transition",
                  subject.status === "published"
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100 hover:bg-amber-100"
                    : "bg-emerald-600 text-white hover:bg-emerald-700",
                ].join(" ")}
              >
                {subject.status === "published" ? "Unpublish" : "Publish"}
              </button>
            ) : null}
          </div>
        ))}

        {subjects.length === 0 ? (
          <div className="bg-slate-50 p-4 text-sm font-medium text-slate-500 ring-1 ring-slate-200/70 md:col-span-2 2xl:col-span-3">
            No subjects in this state yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
