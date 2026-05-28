"use client";

import { useMemo } from "react";

import type {
  AdminSceneBlock,
  AdminSceneDraft,
} from "@/features/admin/papers/types/paper-workspace.types";

export function useSceneTimeline(scene?: AdminSceneDraft) {
  const blocks = useMemo(() => scene?.blocks ?? [], [scene?.blocks]);

  const groups = useMemo(() => {
    const grouped = blocks.reduce<Record<number, AdminSceneBlock[]>>(
      (current, block) => {
        const stepIndex = block.stepIndex ?? 1;
        return {
          ...current,
          [stepIndex]: [...(current[stepIndex] ?? []), block],
        };
      },
      {},
    );

    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([stepIndex, stepBlocks]) => {
        const numericStep = Number(stepIndex);
        const groupMeta = scene?.stepGroups?.find(
          (group) => group.stepIndex === numericStep,
        );

        return {
          stepIndex: numericStep,
          title: groupMeta?.title ?? `Step ${stepIndex}`,
          blocks: stepBlocks,
          startTime: Math.min(
            ...stepBlocks.map((block) => block.startTime ?? 0),
          ),
          endTime: Math.max(
            ...stepBlocks.map(
              (block) => (block.startTime ?? 0) + (block.duration ?? 6),
            ),
          ),
        };
      });
  }, [blocks, scene?.stepGroups]);

  const duration = groups.reduce(
    (max, group) => Math.max(max, group.endTime),
    0,
  );

  function getVisibleBlocks(currentTime: number) {
    return blocks.filter((block) => (block.startTime ?? 0) <= currentTime);
  }

  return {
    blocks,
    duration,
    getVisibleBlocks,
    groups,
  };
}
