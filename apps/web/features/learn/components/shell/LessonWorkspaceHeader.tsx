"use client";

import Link from "next/link";
import { Bookmark, CircleHelp, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { LearnCurriculum } from "../../types";

export function LessonWorkspaceHeader({
  curriculum,
}: {
  curriculum: LearnCurriculum;
}) {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("") ?? "U";

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-between bg-[#f6f8fc]/95 px-5 lg:px-8">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full bg-[#1557c0] text-xs font-semibold text-white transition hover:bg-[#0f49a7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1557c0]/30"
              aria-label="Open user menu"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="z-[9999] min-w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-slate-950">
                {user?.name ?? "User"}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {user?.role ?? "student"}
              </p>
            </div>

            <DropdownMenuSeparator className="my-1 h-px bg-border" />

            <DropdownMenuItem
              onClick={() => router.push("/subjects")}
              className="cursor-pointer rounded-md px-3 py-2 text-sm outline-none hover:bg-[#eaf2ff]"
            >
              My Learning
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 h-px bg-border" />

            <DropdownMenuItem
              onClick={() => {
                signOut();
                router.push("/signin");
              }}
              className="cursor-pointer rounded-md px-3 py-2 text-sm text-destructive outline-none hover:bg-muted"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
