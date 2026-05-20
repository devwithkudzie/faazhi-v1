import { ArrowRight } from "lucide-react";
import type { Lesson } from "../type";

export function TryItPanel({
  isLoading,
  lesson,
}: {
  isLoading: boolean;
  lesson: Lesson | null;
}) {
  const tryIt = lesson?.components.find((component) => component.type === "try_it");

  return (
    <aside className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Try It
      </p>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-20 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : null}

      {!isLoading && tryIt ? (
        <>
          <h3 className="mt-3 font-semibold text-foreground">
            {tryIt.title}
          </h3>

          {tryIt.content.task ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {tryIt.content.task}
            </p>
          ) : null}

          {tryIt.content.markScheme?.length ? (
            <div className="mt-4 rounded-xl bg-primary/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Mark focus
              </p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-muted-foreground">
                {tryIt.content.markScheme.slice(0, 3).map((item) => (
                  <li key={item.criterion}>{item.criterion}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
            Start question <ArrowRight className="h-4 w-4" />
          </button>
        </>
      ) : null}

      {!isLoading && !tryIt ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This lesson does not have a Try It task yet.
        </p>
      ) : null}
    </aside>
  );
}
