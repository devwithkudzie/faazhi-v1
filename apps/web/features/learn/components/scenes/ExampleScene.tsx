import type { Scene } from "../../types";

export function ExampleScene({
  scene,
  sceneTime = 0,
}: {
  scene: Scene;
  sceneTime?: number;
}) {
  const visibleBlocks = scene.visualBlocks?.length
    ? scene.visualBlocks
        .filter((block) => sceneTime >= (block.startTime ?? 0))
        .map((block) => block.text)
    : scene.blocks;

  return (
    <div className="flex h-full items-center justify-center bg-[#f7f9fd] p-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          {scene.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1557c0]">
              {scene.eyebrow}
            </p>
          ) : null}
          <h2 className="mt-4 font-serif-paper text-4xl font-semibold text-foreground">
            {scene.title}
          </h2>
          <div className="mt-6 space-y-3">
            {visibleBlocks?.map((block) => (
              <p
                key={block}
                className="rounded-xl border border-border bg-white p-4 text-sm leading-6 text-muted-foreground shadow-sm"
              >
                {block}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#bfdbfe] bg-white p-6 shadow-[0_24px_70px_rgba(21,87,192,0.12)]">
          <div className="grid grid-cols-8 gap-2">
            {scene.diagram?.bits.map((bit) => (
              <div
                key={`${bit.value}-${bit.bit}`}
                className={[
                  "rounded-xl border p-3 text-center",
                  bit.active
                    ? "border-[#1557c0] bg-[#eaf2ff]"
                    : "border-border bg-muted/40",
                ].join(" ")}
              >
                <p className="text-2xl font-semibold text-foreground">
                  {bit.bit}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {bit.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-[#0f172a] p-5 text-center text-lg font-semibold text-white">
            {scene.diagram?.result}
          </div>
        </div>
      </div>
    </div>
  );
}
