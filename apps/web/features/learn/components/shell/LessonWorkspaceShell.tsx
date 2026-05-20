import type { ReactNode } from "react";
import type { LearnCurriculum, LessonNode } from "../../types";
import { LessonWorkspaceFooter, type DrawerTab } from "./LessonWorkspaceFooter";
import { LessonWorkspaceHeader } from "./LessonWorkspaceHeader";

export function LessonWorkspaceShell({
  canvas,
  curriculum,
  drawer,
  nextLesson,
  onOpenDrawer,
  onSelectLesson,
  previousLesson,
  sidebar,
}: {
  canvas: ReactNode;
  curriculum: LearnCurriculum;
  drawer: ReactNode;
  nextLesson: LessonNode | null;
  onOpenDrawer: (tab: DrawerTab) => void;
  onSelectLesson: (lessonId: string) => void;
  previousLesson: LessonNode | null;
  sidebar: ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f3f6fb]">
      <LessonWorkspaceHeader curriculum={curriculum} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {sidebar}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <main className="min-w-0 flex-1 overflow-hidden">{canvas}</main>
            {drawer}
          </div>

          <LessonWorkspaceFooter
            nextLesson={nextLesson}
            onOpenDrawer={onOpenDrawer}
            onSelectLesson={onSelectLesson}
            previousLesson={previousLesson}
          />
        </div>
      </div>
    </div>
  );
}
