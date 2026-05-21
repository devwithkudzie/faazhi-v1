import Link from "next/link";
import { ArrowRight, FilePenLine, Layers3 } from "lucide-react";

import type { AdminSubject } from "@/features/admin/subjects/types/subject.types";

const actions = [
  {
    label: "Edit subject details",
    description: "Update name, code, level, description, and publishing rules.",
    icon: FilePenLine,
  },
  {
    label: "Manage structure",
    description: "Review papers, topics, subtopics, and assessment placement.",
    icon: Layers3,
  },
];

export function SubjectManagementPanel({
  subject,
}: {
  subject: AdminSubject;
}) {
  return (
    <section className="rounded-[28px] bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-950">
          Subject actions
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          These actions are scoped to {subject.name}.
        </p>
      </div>

      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={`/admin/subjects/${subject.id}`}
              className="group flex items-center justify-between gap-4 rounded-3xl bg-[#f5f9ff] p-4 no-underline ring-1 ring-blue-100 transition hover:bg-[#edf5ff]"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#1557c0]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-950">
                    {action.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {action.description}
                  </span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#1557c0] transition group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
