import type { PublishStatus } from "@/features/admin/subjects/types/subject.types";
import { cn } from "@/shared/lib/utils";

const statusStyles: Record<PublishStatus, string> = {
  draft: "bg-amber-50 text-amber-700 ring-amber-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  archived: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function PublishStatusBadge({ status }: { status: PublishStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}
