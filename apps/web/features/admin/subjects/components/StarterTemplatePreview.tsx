import { CheckCircle2 } from "lucide-react";

import { PublishStatusBadge } from "@/features/admin/subjects/components/PublishStatusBadge";
import type { StarterTemplateItem } from "@/features/admin/subjects/types/subject.types";

export function StarterTemplatePreview({
  items,
}: {
  items: StarterTemplateItem[];
}) {
  return (
    <div className="rounded-3xl bg-[#edf5ff] p-4 ring-1 ring-blue-100">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-[#1557c0]" />
        <h3 className="text-sm font-semibold text-slate-950">
          Starter template
        </h3>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${item.title}`}
            className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 ring-1 ring-blue-100/70"
            style={{ marginLeft: `${index * 14}px` }}
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#eaf2ff] text-xs font-bold text-[#1557c0]">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                {item.label}
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {item.title}
              </p>
            </div>
            <PublishStatusBadge status={item.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
