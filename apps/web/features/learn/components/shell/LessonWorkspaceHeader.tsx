"use client";

import Link from "next/link";
import { Bookmark, CircleHelp, LogOut } from "lucide-react";
import { useAuth } from "@/shared/providers/AuthProvider";
import type { LearnCurriculum } from "../../types";

export function LessonWorkspaceHeader({
  curriculum,
}: {
  curriculum: LearnCurriculum;
}) {
  const { user } = useAuth();
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("") ?? "U";

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-between bg-white px-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <div className="text-2xl font-extrabold tracking-[-0.06em] text-[#0056d6]">
          faazhi
        </div>
        <div className="h-7 w-px bg-border" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {curriculum.subjectTitle} · {curriculum.moduleTitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#1557c0] sm:inline-flex">
          {curriculum.progress}% complete
        </span>
        <Link
          href={`/subjects/${curriculum.subjectId}`}
          className="group relative grid h-9 w-9 place-items-center rounded-lg transition hover:bg-[#eaf2ff] hover:text-[#1557c0] focus-visible:bg-[#eaf2ff] focus-visible:text-[#1557c0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1557c0]/30"
          aria-label="Exit workspace"
        >
          <LogOut className="h-4 w-4" />
          <span className="pointer-events-none absolute right-0 top-11 z-30 whitespace-nowrap rounded-md bg-[#0f172a] px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
            Exit workspace
          </span>
        </Link>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
          aria-label="Bookmark lesson"
        >
          <Bookmark className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
          aria-label="Help"
        >
          <CircleHelp className="h-4 w-4" />
        </button>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#1557c0] text-xs font-semibold text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}
