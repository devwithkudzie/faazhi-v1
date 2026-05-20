import { Bookmark, ChevronRight } from "lucide-react";
import type { LearnCurriculum, LessonNode } from "../../types";

export function WorkspaceHeader({
  curriculum,
  lesson,
}: {
  curriculum: LearnCurriculum;
  lesson: LessonNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-white px-6 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>{curriculum.subjectTitle}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{curriculum.moduleTitle}</span>
        </div>
        <h1 className="mt-1 truncate text-lg font-semibold text-foreground">
          {lesson.title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#1557c0]">
          {curriculum.progress}% complete
        </span>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-lg border border-border transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
          aria-label="Bookmark lesson"
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
