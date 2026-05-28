"use client";

import type {
  AdminSceneBlock,
  AdminSceneDraft,
  AdminSceneTransition,
} from "@/features/admin/papers/types/paper-workspace.types";

const transitions: NonNullable<AdminSceneTransition["type"]>[] = [
  "fade",
  "slide",
  "zoom",
  "crossfade",
];

const animations: NonNullable<AdminSceneBlock["animation"]>[] = [
  "none",
  "fade",
  "slide-up",
  "zoom",
];

export function AnimateTool({
  onUpdateBlock,
  onUpdateScene,
  scene,
  selectedBlockId,
}: {
  onUpdateBlock: (
    sceneId: string,
    blockId: string,
    updates: Partial<AdminSceneBlock>,
  ) => void;
  onUpdateScene: (sceneId: string, updates: Partial<AdminSceneDraft>) => void;
  scene?: AdminSceneDraft;
  selectedBlockId: string | null;
}) {
  const selectedBlock = scene?.blocks?.find(
    (block) => block.id === selectedBlockId,
  );

  function updateTransition(updates: AdminSceneTransition) {
    if (!scene) return;
    onUpdateScene(scene.id, {
      transition: {
        ...scene.transition,
        ...updates,
      },
    });
  }

  function updateSelectedBlock(updates: Partial<AdminSceneBlock>) {
    if (!scene || !selectedBlock) return;
    onUpdateBlock(scene.id, selectedBlock.id, updates);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Scene transition
        </p>
        {!scene ? (
          <p className="mt-3 text-xs text-slate-500">Select a scene first.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {transitions.map((transition) => (
              <button
                key={transition}
                type="button"
                onClick={() => updateTransition({ type: transition })}
                className={[
                  "rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition",
                  scene.transition?.type === transition
                    ? "border-[#1557c0] bg-[#eaf2ff] text-[#1557c0]"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {transition}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Selected block animation
        </p>
        {!selectedBlock ? (
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            Select a block on the canvas to assign reveal motion.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {animations.map((animation) => (
              <button
                key={animation}
                type="button"
                onClick={() => updateSelectedBlock({ animation })}
                className={[
                  "rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition",
                  selectedBlock.animation === animation
                    ? "border-[#1557c0] bg-[#eaf2ff] text-[#1557c0]"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {animation}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-4 text-xs leading-5 text-slate-600 ring-1 ring-slate-200">
        GSAP is reserved for graph drawing, diagram reveals, and formula
        derivations. Framer Motion handles standard block and scene transitions.
      </section>
    </div>
  );
}
