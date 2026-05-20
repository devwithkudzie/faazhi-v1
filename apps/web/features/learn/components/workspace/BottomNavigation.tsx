import { ArrowLeft, ArrowRight } from "lucide-react";
import type { LessonNode } from "../../types";

export function BottomNavigation({
  nextLesson,
  onSelectLesson,
  previousLesson,
}: {
  nextLesson: LessonNode | null;
  onSelectLesson: (lessonId: string) => void;
  previousLesson: LessonNode | null;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border bg-white px-6 py-4">
      <button
        type="button"
        disabled={!previousLesson}
        onClick={() => previousLesson && onSelectLesson(previousLesson.id)}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:bg-[#eaf2ff] hover:text-[#1557c0] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </button>

      <button
        type="button"
        disabled={!nextLesson}
        onClick={() => nextLesson && onSelectLesson(nextLesson.id)}
        className="inline-flex items-center gap-2 rounded-lg border border-[#1557c0] px-4 py-2 text-sm font-semibold text-[#1557c0] transition hover:bg-[#eaf2ff] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Go to next item
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
