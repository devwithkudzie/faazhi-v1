import type { Lesson } from "../type";
import { StepRenderer } from "./StepRenderer";

export function LessonContent({
  error,
  isLoading,
  lesson,
}: {
  error: string | null;
  isLoading: boolean;
  lesson: Lesson | null;
}) {
  if (isLoading) {
    return (
      <article className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-9 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
        <p className="text-sm font-semibold text-destructive">
          Lesson content could not load
        </p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {error}. Check that the API is running on port 4000 and that the
          lesson data has been seeded.
        </p>
      </article>
    );
  }

  if (!lesson) {
    return (
      <article className="rounded-2xl border border-border/60 bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Select a lesson to begin.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">Current lesson</p>

      <h2 className="mt-1 font-serif-paper text-3xl font-semibold text-foreground">
        {lesson.title}
      </h2>

      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {lesson.description}
      </p>

      <div className="mt-6 space-y-4">
        {lesson.components.map((component) => (
          <StepRenderer key={component.id} component={component} />
        ))}
      </div>
    </article>
  );
}
