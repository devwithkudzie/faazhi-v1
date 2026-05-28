"use client";

import Link from "next/link";
import {
  Eye,
  LogOut,
  Mic2,
  Play,
  RadioTower,
  Save,
  WandSparkles,
} from "lucide-react";
import { useState } from "react";

import { PublishStatusBadge } from "@/features/admin/subjects/components/PublishStatusBadge";
import type {
  AdminSubject,
  PublishStatus,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";

export function StudioToolbar({
  dirty,
  lastSavedAt,
  onOpenPreview,
  onSave,
  paper,
  saveState,
  subject,
}: {
  dirty?: boolean;
  lastSavedAt?: string | null;
  onOpenPreview: () => void;
  onSave: () => void;
  paper: SubjectPaperSummary;
  saveState?: "saved" | "dirty" | "saving";
  subject: AdminSubject;
}) {
  const { token } = useAuth();
  const [paperStatus, setPaperStatus] = useState<PublishStatus>(paper.status);
  const [busy, setBusy] = useState(false);
  const visibility =
    subject.status === "published" && paperStatus === "published"
      ? "Visible to students"
      : paperStatus === "published"
        ? "Staged"
        : "Draft";

  async function publishPaper() {
    if (!token) return;

    setBusy(true);
    try {
      const result = await apiRequest<{ paper: SubjectPaperSummary }>(
        `/api/papers/${paper.id}/publish`,
        { method: "POST", token },
      );
      setPaperStatus(result.paper.status);
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="text-2xl font-extrabold tracking-[-0.06em] text-[#0056d6]">
          faazhi
        </div>
        <div className="h-7 w-px bg-slate-200" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">
            {subject.name} {subject.code} · {paper.title}
          </p>
          <p className="mt-0.5 flex items-center gap-2 truncate text-xs text-slate-500">
            <PublishStatusBadge status={paperStatus} />
            <span>{visibility}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden h-9 items-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 lg:inline-flex">
          <Play className="h-4 w-4" />
          Play scene
        </button>
        <button className="hidden h-9 items-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 lg:inline-flex">
          <Mic2 className="h-4 w-4" />
          Narration
        </button>
        <button className="hidden h-9 items-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 lg:inline-flex">
          <WandSparkles className="h-4 w-4" />
          Animate
        </button>
        <button
          onClick={onOpenPreview}
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#eaf2ff] px-3 text-xs font-semibold text-[#1557c0] transition hover:bg-[#dbeafe]"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saveState === "saving"}
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#1557c0] px-3 text-xs font-semibold text-white transition hover:bg-[#124cad] disabled:cursor-not-allowed disabled:opacity-60"
          title={
            lastSavedAt
              ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString()}`
              : "Save workspace"
          }
        >
          <Save className="h-4 w-4" />
          {saveState === "saving"
            ? "Saving"
            : dirty
              ? "Save"
              : "Saved"}
        </button>
        <button
          type="button"
          onClick={() => void publishPaper()}
          disabled={busy || paperStatus === "published"}
          className="hidden h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 md:inline-flex"
        >
          <RadioTower className="h-4 w-4" />
          {paperStatus === "published" ? "Published" : busy ? "Publishing" : "Publish paper"}
        </button>
        <Link
          href={`/admin/subjects/${subject.id}`}
          className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label="Exit studio"
        >
          <LogOut className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
