import { ChevronDown, FileCheck2 } from "lucide-react";
import { useState } from "react";
import type { TopicNode } from "../../types";
import { LessonItem } from "./LessonItem";

export function TopicGroup({
  activeLessonId,
  completedLessonIds = [],
  onSelectAssessment,
  onSelectLesson,
  topic,
}: {
  activeLessonId: string;
  completedLessonIds?: string[];
  onSelectAssessment?: (topicId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  topic: TopicNode;
}) {
  const containsActiveLesson = topic.lessons.some(
    (lesson) => lesson.id === activeLessonId,
  );
  const [isOpen, setIsOpen] = useState(containsActiveLesson);

  return (
    <div className="rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left hover:bg-[#f4f8ff]"
      >
        <span className="h-3.5 w-3.5 rounded-sm border border-muted-foreground/70" />
        <span className="min-w-0 flex-1 text-sm font-semibold leading-5">
          {topic.title}
        </span>
        <span className="text-xs text-muted-foreground">
          {topic.lessonCount} lessons
        </span>
        <ChevronDown
          className={[
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isOpen ? (
        <div className="space-y-1 px-3 pb-3 pl-9">
          {topic.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isActive={lesson.id === activeLessonId}
              isCompleted={completedLessonIds.includes(lesson.id)}
              onSelect={() => onSelectLesson(lesson.id)}
            />
          ))}

          <button
            type="button"
            onClick={() => onSelectAssessment?.(topic.id)}
            className="grid w-full grid-cols-[28px_1fr] gap-3 rounded-xl px-3 py-3 text-left text-[#7a5600] transition hover:bg-[#fff7df]"
          >
            <span className="grid h-6 w-6 place-items-center rounded-md border border-[#b7791f]">
              <FileCheck2 className="h-3.5 w-3.5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">
                {topic.topicalAssessment.title}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Graded · {topic.topicalAssessment.durationLabel}
              </span>
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
