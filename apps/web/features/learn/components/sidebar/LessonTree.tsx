import { FileCheck2, X } from "lucide-react";
import type { LearnCurriculum } from "../../types";
import { TopicGroup } from "./TopicGroup";

export function LessonTree({
  activeLessonId,
  completedLessonIds = [],
  curriculum,
  onClose,
  onSelectModuleAssessment,
  onSelectAssessment,
  onSelectLesson,
}: {
  activeLessonId: string;
  completedLessonIds?: string[];
  curriculum: LearnCurriculum;
  onClose?: () => void;
  onSelectModuleAssessment?: () => void;
  onSelectAssessment?: (topicId: string) => void;
  onSelectLesson: (lessonId: string) => void;
}) {
  return (
    <aside className="relative z-10 hidden min-h-0 w-[380px] shrink-0 flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 lg:flex">
      <div className="flex items-start justify-between gap-4 px-7 py-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground">
            {curriculum.subjectTitle}
          </h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {curriculum.moduleTitle}
          </p>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
            aria-label="Close curriculum"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {curriculum.topics.map((topic) => (
          <TopicGroup
            key={topic.id}
            topic={topic}
            activeLessonId={activeLessonId}
            completedLessonIds={completedLessonIds}
            onSelectAssessment={onSelectAssessment}
            onSelectLesson={onSelectLesson}
          />
        ))}

        <div className="rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
          <button
            type="button"
            onClick={onSelectModuleAssessment}
            className="grid w-full grid-cols-[32px_1fr] gap-3 rounded-2xl p-4 text-left text-[#2f6b27] transition hover:bg-[#edf8ea]"
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
      </div>
    </aside>
  );
}
