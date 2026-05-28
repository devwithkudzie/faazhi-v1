"use client";

import { ChevronDown, ChevronRight, Copy, Layers3, Trash2 } from "lucide-react";
import { useState } from "react";

import type {
  AdminSceneBlock,
  AdminSceneDraft,
} from "@/features/admin/papers/types/paper-workspace.types";

type MoveDirection = "up" | "down";

function groupBlocksByStep(blocks: AdminSceneBlock[]) {
  return Object.entries(
    blocks.reduce<Record<number, AdminSceneBlock[]>>((groups, block) => {
      const stepIndex = block.stepIndex ?? 1;
      return {
        ...groups,
        [stepIndex]: [...(groups[stepIndex] ?? []), block],
      };
    }, {}),
  )
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([stepIndex, stepBlocks]) => ({
      stepIndex: Number(stepIndex),
      blocks: stepBlocks,
    }));
}

export function StepGroupEditor({
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onUpdateBlock,
  onUpdateScene,
  scene,
}: {
  onDeleteBlock: (sceneId: string, blockId: string) => void;
  onDuplicateBlock: (sceneId: string, blockId: string) => void;
  onMoveBlock: (
    sceneId: string,
    blockId: string,
    direction: MoveDirection,
  ) => void;
  onUpdateBlock: (
    sceneId: string,
    blockId: string,
    updates: Partial<AdminSceneBlock>,
  ) => void;
  onUpdateScene: (sceneId: string, updates: Partial<AdminSceneDraft>) => void;
  scene?: AdminSceneDraft;
}) {
  const [collapsedSteps, setCollapsedSteps] = useState<number[]>([]);

  if (!scene) {
    return (
      <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
        Select a scene to manage timed step groups.
      </div>
    );
  }

  const activeScene = scene;
  const groups = groupBlocksByStep(activeScene.blocks ?? []);

  function updateGroupTitle(stepIndex: number, title: string) {
    const existingGroups = activeScene.stepGroups ?? [];
    const hasGroup = existingGroups.some(
      (group) => group.stepIndex === stepIndex,
    );

    onUpdateScene(activeScene.id, {
      stepGroups: hasGroup
        ? existingGroups.map((group) =>
            group.stepIndex === stepIndex ? { ...group, title } : group,
          )
        : [...existingGroups, { stepIndex, title }],
    });
  }

  function moveGroup(stepIndex: number, direction: MoveDirection) {
    const targetStep = direction === "up" ? stepIndex - 1 : stepIndex + 1;
    if (targetStep < 1) return;

    for (const block of activeScene.blocks ?? []) {
      if (block.stepIndex === stepIndex) {
        onUpdateBlock(activeScene.id, block.id, { stepIndex: targetStep });
      }
      if (block.stepIndex === targetStep) {
        onUpdateBlock(activeScene.id, block.id, { stepIndex });
      }
    }
  }

  return (
    <div className="space-y-3">
      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-blue-200 bg-[#f8fbff] p-4 text-center text-xs text-slate-500">
          No blocks yet. Add text or interaction blocks, then group them into
          timed steps.
        </div>
      ) : null}

      {groups.map((group) => {
        const collapsed = collapsedSteps.includes(group.stepIndex);
        const groupTitle =
          activeScene.stepGroups?.find(
            (item) => item.stepIndex === group.stepIndex,
          )?.title ?? `Step ${group.stepIndex}`;

        return (
          <div
            key={group.stepIndex}
            className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCollapsedSteps((current) =>
                    collapsed
                      ? current.filter((step) => step !== group.stepIndex)
                      : [...current, group.stepIndex],
                  )
                }
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-[#eaf2ff] hover:text-[#1557c0]"
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              <Layers3 className="h-4 w-4 text-[#1557c0]" />
              <input
                value={groupTitle}
                onChange={(event) =>
                  updateGroupTitle(group.stepIndex, event.target.value)
                }
                className="min-w-0 flex-1 rounded-lg border border-transparent bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-[#1557c0]"
              />
              <button
                type="button"
                onClick={() => moveGroup(group.stepIndex, "up")}
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveGroup(group.stepIndex, "down")}
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                ↓
              </button>
            </div>

            {!collapsed ? (
              <div className="mt-3 space-y-2">
                {group.blocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold capitalize text-slate-800">
                        {block.type}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {block.startTime ?? 0}s · {block.duration ?? 6}s
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onMoveBlock(activeScene.id, block.id, "up")
                        }
                        className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-white"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onMoveBlock(activeScene.id, block.id, "down")
                        }
                        className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-white"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onDuplicateBlock(activeScene.id, block.id)
                        }
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-white hover:text-[#1557c0]"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteBlock(activeScene.id, block.id)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
