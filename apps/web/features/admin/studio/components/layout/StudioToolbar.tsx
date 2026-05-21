"use client";

import Link from "next/link";
import { Eye, LogOut, Mic2, Play, RadioTower, Save, WandSparkles } from "lucide-react";

import type {
  AdminSubject,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";

export function StudioToolbar({
  onOpenPreview,
  paper,
  subject,
}: {
  onOpenPreview: () => void;
  paper: SubjectPaperSummary;
  subject: AdminSubject;
}) {
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
          <p className="truncate text-xs text-slate-500">
            Learning scene composer
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
        <button className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#1557c0] px-3 text-xs font-semibold text-white transition hover:bg-[#124cad]">
          <Save className="h-4 w-4" />
          Save
        </button>
        <button className="hidden h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 md:inline-flex">
          <RadioTower className="h-4 w-4" />
          Publish
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
