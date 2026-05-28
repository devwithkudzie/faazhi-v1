import type { Scene, SceneVisualBlock } from "../../types";

function getHorizontalLayout(scene: Scene) {
  switch (scene.layout?.horizontalAlign) {
    case "left":
      return {
        container: "items-start text-left",
        blocks: "mr-auto",
      };
    case "right":
      return {
        container: "items-end text-right",
        blocks: "ml-auto",
      };
    case "center":
    default:
      return {
        container: "items-center text-center",
        blocks: "mx-auto",
      };
  }
}

function getVerticalLayout(scene: Scene) {
  switch (scene.layout?.verticalAlign) {
    case "top":
      return "justify-start";
    case "bottom":
      return "justify-end";
    case "center":
    default:
      return "justify-center";
  }
}

function VisualBlock({ block }: { block: SceneVisualBlock }) {
  if (block.type === "list") {
    const items = block.items?.length ? block.items : [block.text];

    return (
      <ul className="mx-auto max-w-xl list-disc space-y-2 pl-6 text-left text-xl font-semibold leading-8 text-foreground/80">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "numbered-list") {
    const items = block.items?.length ? block.items : [block.text];

    return (
      <ol className="mx-auto max-w-xl list-decimal space-y-2 pl-6 text-left text-xl font-semibold leading-8 text-foreground/80">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }

  if (block.type === "callout") {
    return (
      <p className="rounded-2xl border border-blue-100 bg-white/72 px-5 py-4 text-xl font-semibold leading-8 text-[#123f81] shadow-sm">
        {block.text}
      </p>
    );
  }

  if (block.type === "code") {
    return (
      <pre className="max-h-64 overflow-auto rounded-2xl bg-slate-950 px-5 py-4 text-left text-sm leading-7 text-white shadow-sm">
        <code>{block.text}</code>
      </pre>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote className="border-l-4 border-[#1557c0] bg-white/50 px-5 py-3 text-xl font-semibold italic leading-8 text-foreground/75">
        {block.text}
      </blockquote>
    );
  }

  if (block.type === "heading") {
    return (
      <p className="text-2xl font-bold leading-9 text-foreground">
        {block.text}
      </p>
    );
  }

  return (
    <p className="text-xl font-semibold leading-8 text-foreground/80">
      {block.text}
    </p>
  );
}

function isBlockVisible(block: SceneVisualBlock, sceneTime: number) {
  return sceneTime >= (block.startTime ?? 0);
}

export function ConceptScene({
  scene,
  sceneTime = 0,
}: {
  scene: Scene;
  sceneTime?: number;
}) {
  const visualBlocks = scene.blocks?.length ? scene.blocks : [scene.narration];
  const typedBlocks =
    scene.visualBlocks?.length
      ? scene.visualBlocks
      : visualBlocks.map((block, index) => ({
          id: `${scene.id}-text-${index}`,
          type: "paragraph" as const,
          text: block,
        }));
  const visibleBlocks = typedBlocks.filter((block) =>
    isBlockVisible(block, sceneTime),
  );
  const horizontalLayout = getHorizontalLayout(scene);
  const verticalLayout = getVerticalLayout(scene);

  return (
    <div
      className={[
        "relative flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_20%,#dbeafe_0%,#f8fbff_38%,#eef4ff_100%)] p-10",
        horizontalLayout.container,
        verticalLayout,
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-10 mx-auto h-44 w-44 rounded-full bg-[#1557c0]/10 blur-3xl" />
      <div className="relative max-w-4xl">
        {scene.eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1557c0]">
            {scene.eyebrow}
          </p>
        ) : null}
        <h2 className="mt-4 font-serif-paper text-5xl font-semibold text-foreground">
          {scene.title}
        </h2>

        {scene.diagram ? (
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {scene.diagram.bits.map((bit) => (
              <div
                key={`${bit.value}-${bit.bit}`}
                className={[
                  "min-w-16 rounded-xl border px-4 py-3 shadow-sm transition",
                  bit.active
                    ? "border-[#1557c0] bg-[#1557c0] text-white"
                    : "border-border bg-white/75 text-foreground",
                ].join(" ")}
              >
                <p className="text-3xl font-semibold">{bit.bit}</p>
                <p className="mt-1 text-xs opacity-70">{bit.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {visibleBlocks.length > 0 ? (
          <div
            className={[
              "mt-8 max-w-2xl space-y-3",
              horizontalLayout.blocks,
            ].join(" ")}
          >
            {visibleBlocks.map((block) => (
              <VisualBlock key={block.id} block={block} />
            ))}
          </div>
        ) : null}

        {scene.diagram?.result ? (
          <p className="mt-5 text-lg font-semibold text-[#1557c0]">
            {scene.diagram.result}
          </p>
        ) : null}
      </div>
    </div>
  );
}
