"use client";

import { useMemo, useState } from "react";
import { Clock3, Layers3, Plus, Trash2 } from "lucide-react";

import type {
  AdminSceneBlock,
  AdminSceneDraft,
  AdminSceneType,
} from "@/features/admin/papers/types/paper-workspace.types";

export type ContentTab = "scene" | "flow";
type BlockAnimation = NonNullable<AdminSceneBlock["animation"]>;

const sceneTypes = [
  { type: "concept", label: "Concept scene" },
  { type: "example", label: "Example scene" },
  { type: "diagram", label: "Diagram scene" },
  { type: "checkpoint", label: "Checkpoint scene" },
  { type: "exam-extract", label: "Exam extract" },
] satisfies Array<{ type: AdminSceneType; label: string }>;

const animations: BlockAnimation[] = ["none", "fade", "slide-up", "zoom"];

const tabLabels: Record<ContentTab, string> = {
  scene: "Scene",
  flow: "Flow",
};

function parseNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getSceneDuration(blocks: AdminSceneBlock[]) {
  return blocks.reduce(
    (max, block) => Math.max(max, (block.startTime ?? 0) + (block.duration ?? 6)),
    0,
  );
}

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
      startTime: Math.min(...stepBlocks.map((block) => block.startTime ?? 0)),
    }));
}

export function ContentTool({
  activeTab,
  scene,
  onActiveTabChange,
  onCreateScene,
  onUpdateScene,
  onUpdateBlock,
  onDeleteBlock,
  onSelectBlock,
}: {
  activeTab: ContentTab;
  scene?: AdminSceneDraft;
  onActiveTabChange: (tab: ContentTab) => void;
  onCreateScene: (type: AdminSceneType) => void;
  onUpdateScene: (sceneId: string, updates: Partial<AdminSceneDraft>) => void;
  onUpdateBlock: (
    sceneId: string,
    blockId: string,
    updates: Partial<AdminSceneBlock>,
  ) => void;
  onDeleteBlock: (sceneId: string, blockId: string) => void;
  onDuplicateBlock: (sceneId: string, blockId: string) => void;
  onSelectBlock: (blockId: string) => void;
  onMoveBlock: (
    sceneId: string,
    blockId: string,
    direction: "up" | "down",
  ) => void;
}) {
  const [newSceneType, setNewSceneType] =
    useState<AdminSceneType>("concept");

  const blocks = useMemo(() => scene?.blocks ?? [], [scene?.blocks]);
  const groupedBlocks = useMemo(() => groupBlocksByStep(blocks), [blocks]);
  const sceneDuration = getSceneDuration(blocks);
  const selectedTab: ContentTab = activeTab === "scene" ? "scene" : "flow";

  function updateSelectedScene(updates: Partial<AdminSceneDraft>) {
    if (!scene) return;
    onUpdateScene(scene.id, updates);
  }

  function updateBlock(blockId: string, updates: Partial<AdminSceneBlock>) {
    if (!scene) return;
    onUpdateBlock(scene.id, blockId, updates);
  }

  function updateGroupTitle(stepIndex: number, title: string) {
    if (!scene) return;

    const existingGroups = scene.stepGroups ?? [];
    const hasGroup = existingGroups.some(
      (group) => group.stepIndex === stepIndex,
    );

    onUpdateScene(scene.id, {
      stepGroups: hasGroup
        ? existingGroups.map((group) =>
            group.stepIndex === stepIndex ? { ...group, title } : group,
          )
        : [...existingGroups, { stepIndex, title }],
    });
  }

  function updateGroupStartTime(stepBlocks: AdminSceneBlock[], value: string) {
    if (!scene) return;

    const startTime = parseNumber(value, stepBlocks[0]?.startTime ?? 0);

    for (const block of stepBlocks) {
      onUpdateBlock(scene.id, block.id, { startTime });
    }
  }

  function selectStep(stepBlocks: AdminSceneBlock[]) {
    const firstBlock = stepBlocks[0];
    if (!firstBlock) return;
    onSelectBlock(firstBlock.id);
  }

  function moveGroup(stepIndex: number, direction: "up" | "down") {
    if (!scene) return;

    const targetStep = direction === "up" ? stepIndex - 1 : stepIndex + 1;
    if (targetStep < 1) return;

    for (const block of scene.blocks ?? []) {
      if (block.stepIndex === stepIndex) {
        onUpdateBlock(scene.id, block.id, { stepIndex: targetStep });
      }

      if (block.stepIndex === targetStep) {
        onUpdateBlock(scene.id, block.id, { stepIndex });
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        {(["scene", "flow"] as ContentTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onActiveTabChange(tab)}
            className={[
              "rounded-lg px-2 py-1.5 text-xs font-semibold transition",
              selectedTab === tab
                ? "bg-white text-[#1557c0] shadow-sm"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-800",
            ].join(" ")}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {selectedTab === "scene" ? (
        <div className="space-y-3">
          <section className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
              Selected scene
            </p>

            {!scene ? (
              <p className="mt-2 text-sm text-slate-500">
                Select a scene from the timeline to edit it.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl bg-[#f8fbff] p-3 ring-1 ring-blue-100">
                  <p className="text-xs font-semibold text-slate-500">
                    Current
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {scene.title}
                  </p>
                  <p className="mt-1 text-xs capitalize text-[#1557c0]">
                    {scene.type.replace("-", " ")}
                  </p>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-600">
                    Scene type
                  </span>
                  <select
                    value={scene.type}
                    onChange={(event) =>
                      updateSelectedScene({
                        type: event.target.value as AdminSceneType,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0] focus:ring-2 focus:ring-[#1557c0]/10"
                  >
                    {sceneTypes.map((item) => (
                      <option key={item.type} value={item.type}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
              Add scene
            </p>

            <div className="mt-3 flex gap-2">
              <select
                value={newSceneType}
                onChange={(event) =>
                  setNewSceneType(event.target.value as AdminSceneType)
                }
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0]"
              >
                {sceneTypes.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => onCreateScene(newSceneType)}
                className="inline-flex items-center gap-1 rounded-xl bg-[#1557c0] px-3 py-2 text-xs font-semibold text-white hover:bg-[#124aa3]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedTab === "flow" ? (
        <section className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
              Scene flow
            </p>

            <div className="rounded-full bg-[#eaf2ff] px-2.5 py-1 text-xs font-bold text-[#1557c0]">
              {sceneDuration}s
            </div>
          </div>

          {!scene ? (
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
              Select a scene to edit flow.
            </div>
          ) : blocks.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-blue-200 bg-[#f8fbff] p-4 text-center text-xs text-slate-500">
              Add text blocks, then set when each step appears.
            </div>
          ) : (
            <div className="mt-3 space-y-2.5">
              {groupedBlocks.map((group) => {
                const groupTitle =
                  scene.stepGroups?.find(
                    (item) => item.stepIndex === group.stepIndex,
                  )?.title ?? `Step ${group.stepIndex}`;

                return (
                  <div
                    key={group.stepIndex}
                    className="rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-200"
                    onMouseEnter={() => selectStep(group.blocks)}
                    onFocus={() => selectStep(group.blocks)}
                  >
                    <div className="grid grid-cols-[1fr_58px_44px] items-end gap-2">
                      <label className="min-w-0">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Step
                        </span>
                        <div className="flex min-w-0 items-center gap-2">
                          <Layers3 className="h-3.5 w-3.5 shrink-0 text-[#1557c0]" />
                          <input
                            value={groupTitle}
                            onChange={(event) =>
                              updateGroupTitle(
                                group.stepIndex,
                                event.target.value,
                              )
                            }
                            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#1557c0]"
                          />
                        </div>
                      </label>

                      <label>
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Start
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={group.startTime}
                          onChange={(event) =>
                            updateGroupStartTime(
                              group.blocks,
                              event.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#1557c0]"
                        />
                      </label>

                      <div className="flex gap-1 pb-px">
                        <button
                          type="button"
                          onClick={() => moveGroup(group.stepIndex, "up")}
                          className="h-7 flex-1 rounded-lg text-xs font-bold text-slate-500 hover:bg-white"
                          title="Move step up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveGroup(group.stepIndex, "down")}
                          className="h-7 flex-1 rounded-lg text-xs font-bold text-slate-500 hover:bg-white"
                          title="Move step down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {group.blocks.map((block) => (
                        <div
                          key={block.id}
                          className="grid grid-cols-[1fr_62px_84px_auto] items-end gap-1.5 rounded-lg bg-white p-2 ring-1 ring-slate-200 transition hover:ring-[#1557c0]/35"
                          onMouseEnter={() => onSelectBlock(block.id)}
                          onFocus={() => onSelectBlock(block.id)}
                        >
                          <label className="min-w-0">
                            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Block
                            </span>
                            <div className="flex min-w-0 items-center gap-1.5">
                              <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#1557c0]" />
                              <select
                                value={block.stepIndex ?? group.stepIndex}
                                onChange={(event) =>
                                  updateBlock(block.id, {
                                    stepIndex: parseNumber(
                                      event.target.value,
                                      block.stepIndex ?? group.stepIndex,
                                    ),
                                  })
                                }
                                className="min-w-0 flex-1 rounded-md border border-slate-200 px-1.5 py-1 text-xs capitalize outline-none focus:border-[#1557c0]"
                              >
                                {groupedBlocks.map((item) => (
                                  <option
                                    key={item.stepIndex}
                                    value={item.stepIndex}
                                  >
                                    {block.type} · step {item.stepIndex}
                                  </option>
                                ))}
                                <option value={groupedBlocks.length + 1}>
                                  {block.type} · new step
                                </option>
                              </select>
                            </div>
                          </label>

                          <label>
                            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Duration
                            </span>
                            <input
                              type="number"
                              min={1}
                              value={block.duration ?? 6}
                              onChange={(event) =>
                                updateBlock(block.id, {
                                  duration: parseNumber(
                                    event.target.value,
                                    block.duration ?? 6,
                                  ),
                                })
                              }
                              className="w-full rounded-md border border-slate-200 px-1.5 py-1 text-xs outline-none focus:border-[#1557c0]"
                            />
                          </label>

                          <label>
                            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Motion
                            </span>
                            <select
                              value={block.animation ?? "fade"}
                              onChange={(event) =>
                                updateBlock(block.id, {
                                  animation: event.target
                                    .value as BlockAnimation,
                                })
                              }
                              className="w-full rounded-md border border-slate-200 px-1.5 py-1 text-xs outline-none focus:border-[#1557c0]"
                            >
                              {animations.map((animation) => (
                                <option key={animation} value={animation}>
                                  {animation}
                                </option>
                              ))}
                            </select>
                          </label>

                          <div className="pb-px">
                            <button
                              type="button"
                              onClick={() => onDeleteBlock(scene.id, block.id)}
                              className="grid h-7 w-7 place-items-center rounded-md text-red-500 hover:bg-red-50"
                              title="Delete block"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
