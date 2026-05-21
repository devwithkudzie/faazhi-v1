import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import type { LearnCurriculum, LessonNode } from "../../types";
import { LessonWorkspaceFooter, type DrawerTab } from "./LessonWorkspaceFooter";
import { LessonWorkspaceHeader } from "./LessonWorkspaceHeader";

export function LessonWorkspaceShell({
  canvas,
  curriculum,
  drawer,
  isSidebarOpen = true,
  nextLesson,
  onOpenDrawer,
  onOpenSidebar,
  onSelectLesson,
  previousLesson,
  sidebar,
}: {
  canvas: ReactNode;
  curriculum: LearnCurriculum;
  drawer: ReactNode;
  isSidebarOpen?: boolean;
  nextLesson: LessonNode | null;
  onOpenDrawer: (tab: DrawerTab) => void;
  onOpenSidebar?: () => void;
  onSelectLesson: (lessonId: string) => void;
  previousLesson: LessonNode | null;
  sidebar: ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,#f6f8fc_0%,#edf3f8_100%)]">
      <LessonWorkspaceHeader curriculum={curriculum} />

      <div className="flex min-h-0 flex-1 gap-5 overflow-hidden p-5">
        {sidebar}

        {!isSidebarOpen && onOpenSidebar ? (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="hidden min-h-0 w-[74px] shrink-0 place-items-start justify-center rounded-[28px] bg-white/95 px-0 py-8 text-slate-700 shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 transition hover:bg-white hover:text-[#1557c0] lg:grid"
            aria-label="Open curriculum"
          >
            <Menu className="h-7 w-7" />
          </button>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 backdrop-blur">
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
