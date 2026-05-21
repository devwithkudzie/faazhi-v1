import Link from "next/link";
import { Eye, Rocket } from "lucide-react";

import { PublishStatusBadge } from "@/features/admin/subjects/components/PublishStatusBadge";
import type { AdminSubject } from "@/features/admin/subjects/types/subject.types";

export function SubjectHero({ subject }: { subject: AdminSubject }) {
  return (
    <section className="rounded-[32px] bg-white/88 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#1557c0]">
              {subject.code}
            </p>
            <PublishStatusBadge status={subject.status} />
          </div>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            {subject.name}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {subject.level}
          </p>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {subject.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/subjects/${subject.id}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#edf5ff] px-5 text-sm font-semibold text-[#1557c0] no-underline transition hover:bg-[#dbeafe]"
          >
            <Eye className="h-5 w-5" />
            Preview
          </Link>
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">
            <Rocket className="h-5 w-5" />
            Publish
          </button>
        </div>
      </div>
    </section>
  );
}
