import { ArrowLeft, ArrowRight, BookText, NotebookText, Sparkles } from "lucide-react";
import type { LessonNode } from "../../types";

export type DrawerTab = "transcript" | "notes" | "takeaways";

export function LessonWorkspaceFooter({
  nextLesson,
  onOpenDrawer,
  onSelectLesson,
  previousLesson,
}: {
  nextLesson: LessonNode | null;
  onOpenDrawer: (tab: DrawerTab) => void;
  onSelectLesson: (lessonId: string) => void;
  previousLesson: LessonNode | null;
}) {
  return (
    <footer className="relative z-10 flex h-16 shrink-0 items-center justify-between gap-3 bg-white px-5 shadow-[0_-8px_24px_rgba(15,23,42,0.07)] lg:px-7">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenDrawer("transcript")}
          className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
        >
          <BookText className="h-4 w-4" />
          Transcript
        </button>
        <button
          type="button"
          onClick={() => onOpenDrawer("notes")}
          className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
        >
          <NotebookText className="h-4 w-4" />
          Notes
        </button>
        <button
          type="button"
          onClick={() => onOpenDrawer("takeaways")}
          className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
        >
          <Sparkles className="h-4 w-4" />
          Key takeaways
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          disabled={!previousLesson}
          onClick={() => previousLesson && onSelectLesson(previousLesson.id)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold transition hover:bg-[#eaf2ff] hover:text-[#1557c0] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous item
        </button>

        <button
          type="button"
          disabled={!nextLesson}
          onClick={() => nextLesson && onSelectLesson(nextLesson.id)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1557c0] px-4 text-sm font-semibold text-white transition hover:bg-[#0f49a7] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next item
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
}
