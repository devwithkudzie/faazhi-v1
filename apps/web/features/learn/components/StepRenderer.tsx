import type { LessonBlock, LessonComponent } from "../type";

function renderBlock(block: LessonBlock, index: number) {
  if (block.type === "paragraph") {
    return (
      <p key={index} className="text-sm leading-7 text-muted-foreground">
        {block.text}
      </p>
    );
  }

  if (block.type === "list") {
    return (
      <ul
        key={index}
        className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground"
      >
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <div
      key={index}
      className="rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm"
    >
      <p className="font-semibold text-primary">{block.label}</p>
      <p className="mt-1 leading-7 text-muted-foreground">{block.text}</p>
    </div>
  );
}

export function StepRenderer({ component }: { component: LessonComponent }) {
  const { content } = component;

  if (component.type === "example") {
    return (
      <section className="rounded-2xl border border-border/60 bg-muted/30 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-foreground">{component.title}</h3>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Worked example
          </span>
        </div>

        {content.problem ? (
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {content.problem}
          </p>
        ) : null}

        {content.code ? (
          <pre className="mt-4 overflow-x-auto rounded-xl bg-[#0f172a] p-4 text-sm leading-6 text-white">
            <code>{content.code}</code>
          </pre>
        ) : null}

        {content.explanation ? (
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {content.explanation}
          </p>
        ) : null}
      </section>
    );
  }

  if (component.type === "try_it") {
    return (
      <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-foreground">{component.title}</h3>
          {content.marks ? (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {content.marks} marks
            </span>
          ) : null}
        </div>

        {content.task ? (
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {content.task}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-foreground">{component.title}</h3>
        {component.duration ? (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {component.duration} min
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-4">
        {content.blocks?.map(renderBlock)}
      </div>
    </section>
  );
}
