import Link from "next/link";
import { Check, Cloud, Eye, Loader2, LogOut, Save } from "lucide-react";

import { PublishStatusBadge } from "@/features/admin/subjects/components/PublishStatusBadge";
import type {
  AdminSubject,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";

export function PaperWorkspaceHeader({
  hasUnsavedChanges = false,
  onSave,
  paper,
  saveState = "saved",
  subject,
}: {
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  paper: SubjectPaperSummary;
  saveState?: "idle" | "dirty" | "saving" | "saved" | "error";
  subject: AdminSubject;
}) {
  const saveLabel =
    saveState === "saving"
      ? "Saving..."
      : saveState === "saved"
        ? "Saved"
        : saveState === "error"
          ? "Retry save"
          : hasUnsavedChanges
            ? "Save changes"
            : "Save draft";

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-between bg-[#f6f8fc]/95 px-5 lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <div className="text-2xl font-extrabold tracking-[-0.06em] text-[#0056d6]">
          faazhi
        </div>
        <div className="h-7 w-px bg-slate-300" />
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-950">
              {subject.name} {subject.code} · {paper.title}
            </p>
            <PublishStatusBadge status={paper.status} />
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            Admin paper lesson workspace · {hasUnsavedChanges ? "Unsaved changes" : "Restored"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 md:inline-flex">
          {saveState === "saving" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : saveState === "saved" ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Cloud className="h-3.5 w-3.5" />
          )}
          {saveState === "error" ? "Save failed" : hasUnsavedChanges ? "Unsaved" : "Saved locally"}
        </span>
        <Link
          href={`/subjects/${subject.id}/learn/${paper.id}`}
          className="hidden h-9 items-center justify-center gap-2 rounded-xl bg-[#eaf2ff] px-3 text-xs font-semibold text-[#1557c0] no-underline transition hover:bg-[#dbeafe] sm:inline-flex"
        >
          <Eye className="h-4 w-4" />
          Student preview
        </Link>
        <button
          type="button"
          onClick={onSave}
          disabled={saveState === "saving"}
          className="hidden h-9 items-center justify-center gap-2 rounded-xl bg-[#1557c0] px-3 text-xs font-semibold text-white transition hover:bg-[#124cad] disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
        >
          <Save className="h-4 w-4" />
          {saveLabel}
        </button>
        <Link
          href={`/admin/subjects/${subject.id}`}
          className="group relative grid h-9 w-9 place-items-center rounded-lg transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
          aria-label="Exit paper workspace"
        >
          <LogOut className="h-4 w-4" />
          <span className="pointer-events-none absolute right-0 top-11 z-30 whitespace-nowrap rounded-md bg-[#0f172a] px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
            Exit workspace
          </span>
        </Link>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#1557c0] text-xs font-semibold text-white">
          AD
        </div>
      </div>
    </header>
  );
}
