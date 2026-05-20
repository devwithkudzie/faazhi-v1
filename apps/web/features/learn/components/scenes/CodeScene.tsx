import type { Scene } from "../../types";

export function CodeScene({ scene }: { scene: Scene }) {
  return (
    <div className="flex h-full items-center justify-center bg-[#f7f9fd] p-10">
      <pre className="w-full max-w-4xl overflow-auto rounded-3xl bg-[#0f172a] p-8 text-sm leading-7 text-white">
        <code>{scene.code ?? scene.narration}</code>
      </pre>
    </div>
  );
}
