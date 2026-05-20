import type { Scene } from "../../types";

export function CalloutScene({ scene }: { scene: Scene }) {
  return (
    <div className="flex h-full items-center justify-center bg-[#f7f9fd] p-10">
      <div className="max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="font-serif-paper text-4xl font-semibold text-foreground">
          {scene.title}
        </h2>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          {scene.narration}
        </p>
      </div>
    </div>
  );
}
