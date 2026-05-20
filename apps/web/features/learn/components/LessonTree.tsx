import { BookOpenCheck, CheckCircle2, Circle } from "lucide-react";
import type { PaperCourse } from "../type";

export function LessonTree({
  course,
  paperId,
  activeLessonId,
  isLoading,
  onSelectLesson,
}: {
  course: PaperCourse | null;
  paperId: string;
  activeLessonId: string | null;
  isLoading: boolean;
  onSelectLesson: (lessonId: string) => void;
}) {
  return (
    <aside className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <BookOpenCheck className="h-4 w-4 text-primary" />
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {paperId.replace("-", " ")} lessons
        </p>
      </div>

      <div className="mt-4 max-h-[calc(100vh-15rem)] space-y-5 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : null}

        {!isLoading && course?.topics.length ? (
          course.topics.map((topic) => (
            <div key={topic.id}>
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {topic.title}
              </h2>

              <div className="mt-2 space-y-1">
                {topic.lessons.map((lesson, lessonIndex) => {
                  const isActive = lesson.id === activeLessonId;
                  const isDone = topic.position === 0 && lessonIndex === 0;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                        isActive
                          ? "bg-primary-soft font-semibold text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0" />
                      )}

                      <span>{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        ) : null}

        {!isLoading && !course?.topics.length ? (
          <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            No lessons are available for this paper yet.
          </p>
        ) : null}
      </div>
    </aside>
  );
}
