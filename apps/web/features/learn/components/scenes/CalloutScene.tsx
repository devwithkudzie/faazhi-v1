import type { Scene } from "../../types";

export function CalloutScene({
  scene,
  sceneTime = 0,
}: {
  scene: Scene;
  sceneTime?: number;
}) {
  const visualBlocks = scene.visualBlocks?.length
    ? scene.visualBlocks
        .filter((block) => sceneTime >= (block.startTime ?? 0))
        .map((block) => block.text)
    : scene.blocks?.length
      ? scene.blocks
      : [scene.narration];

  return (
    <div className="flex h-full items-center justify-center bg-[#f7f9fd] p-10">
      <div className="max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="font-serif-paper text-4xl font-semibold text-foreground">
          {scene.title}
        </h2>
        <div className="mt-5 space-y-3">
          {visualBlocks.map((block) => (
            <p key={block} className="text-lg leading-8 text-muted-foreground">
              {block}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
