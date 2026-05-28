import type { Scene } from "../../types";

export function VideoScene({ scene }: { scene: Scene }) {
  return (
    <div className="flex h-full items-center justify-center bg-[#eef4ff] p-10">
      <div className="max-w-3xl rounded-3xl border border-[#bfdbfe] bg-white p-8 text-center shadow-sm">
        {scene.eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1557c0]">
            {scene.eyebrow}
          </p>
        ) : null}
        <h2 className="mt-4 font-serif-paper text-4xl font-semibold text-foreground">
          {scene.title}
        </h2>
        <p className="mt-4 text-muted-foreground">
          A real video or generated voiceover scene can mount here later.
        </p>
      </div>
    </div>
  );
}
