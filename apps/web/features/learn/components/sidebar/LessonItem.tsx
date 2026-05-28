import type { LessonNode } from "../../types";
import { ProgressIndicator } from "./ProgressIndicator";

export function LessonItem({
  isActive,
  isCompleted = false,
  lesson,
  onSelect,
}: {
  isActive: boolean;
  isCompleted?: boolean;
  lesson: LessonNode;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "grid w-full grid-cols-[28px_1fr] gap-3 rounded-xl px-3 py-3 text-left transition",
        isActive
          ? "bg-[#eef5ff] text-foreground"
          : "hover:bg-[#f4f8ff] text-foreground",
      ].join(" ")}
    >
      <ProgressIndicator
        state={isCompleted ? "completed" : isActive ? "current" : lesson.state}
      />

      <span>
        <span className="block text-sm font-semibold leading-5">
          {lesson.title}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {lesson.kind === "reading" ? "Reading" : "Lesson"} · {lesson.durationLabel}
        </span>
      </span>
    </button>
  );
}
