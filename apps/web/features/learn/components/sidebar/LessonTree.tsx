import { FileCheck2 } from "lucide-react";
import type { LearnCurriculum } from "../../types";
import { TopicGroup } from "./TopicGroup";

export function LessonTree({
  activeLessonId,
  curriculum,
  onSelectLesson,
}: {
  activeLessonId: string;
  curriculum: LearnCurriculum;
  onSelectLesson: (lessonId: string) => void;
}) {
  return (
    <aside className="relative z-10 hidden min-h-0 w-[360px] shrink-0 flex-col bg-white shadow-[8px_0_28px_rgba(15,23,42,0.08)] lg:flex">
      <div className="px-8 py-5 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <h1 className="text-base font-semibold text-foreground">
          {curriculum.subjectTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {curriculum.moduleTitle}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {curriculum.topics.map((topic) => (
          <TopicGroup
            key={topic.id}
            topic={topic}
            activeLessonId={activeLessonId}
            onSelectLesson={onSelectLesson}
          />
        ))}
      </div>

      <div className="p-4 shadow-[0_-8px_22px_rgba(15,23,42,0.06)]">
        <button
          type="button"
          className="grid w-full grid-cols-[32px_1fr] gap-3 rounded-xl p-3 text-left text-[#2f6b27] transition hover:bg-[#edf8ea]"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md border border-[#2f6b27]">
            <FileCheck2 className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold">
              {curriculum.moduleAssessment.title}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Graded · {curriculum.moduleAssessment.durationLabel}
            </span>
          </span>
        </button>
      </div>
    </aside>
  );
}
