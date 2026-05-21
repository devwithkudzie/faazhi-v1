"use client";

import { useState } from "react";
import {
  CheckSquare,
  FileText,
  Image,
  Plus,
  Type,
} from "lucide-react";

import type {
  AdminSceneDraft,
  AdminSceneType,
} from "@/features/admin/papers/types/paper-workspace.types";

const sceneTypes = [
  { type: "concept", label: "Concept scene" },
  { type: "example", label: "Example scene" },
  { type: "diagram", label: "Diagram scene" },
  { type: "checkpoint", label: "Checkpoint scene" },
  { type: "exam-extract", label: "Exam extract" },
] satisfies Array<{ type: AdminSceneType; label: string }>;

const blockTypes = [
  { id: "heading", label: "Heading", icon: Type },
  { id: "paragraph", label: "Paragraph", icon: FileText },
  { id: "list", label: "List", icon: FileText },
  { id: "formula", label: "Formula", icon: Type },
  { id: "callout", label: "Callout", icon: FileText },
  { id: "image", label: "Image", icon: Image },
  { id: "checkpoint", label: "Checkpoint", icon: CheckSquare },
];

export function ContentTool({
  scene,
  onCreateScene,
  onUpdateScene,
  onAddBlock,
}: {
  scene?: AdminSceneDraft;
  onCreateScene: (type: AdminSceneType) => void;
  onUpdateScene: (sceneId: string, updates: Partial<AdminSceneDraft>) => void;
    onAddBlock: (sceneId: string, blockType: string) => void;
}) {
  const [newSceneType, setNewSceneType] =
    useState<AdminSceneType>("concept");

  function updateSelectedScene(updates: Partial<AdminSceneDraft>) {
    if (!scene) return;
    onUpdateScene(scene.id, updates);
  }

  return (
    <div className="space-y-4">
      {/* Current selected scene first */}
      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
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
                Scene title
              </span>
              <input
                value={scene.title}
                onChange={(event) =>
                  updateSelectedScene({ title: event.target.value })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0] focus:ring-2 focus:ring-[#1557c0]/10"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-600">
                Summary
              </span>
              <textarea
                value={scene.summary ?? ""}
                onChange={(event) =>
                  updateSelectedScene({ summary: event.target.value })
                }
                placeholder="Short explanation of what this scene teaches..."
                className="mt-1 min-h-[90px] w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-[#1557c0] focus:ring-2 focus:ring-[#1557c0]/10"
              />
            </label>
          </div>
        )}
      </section>

      {/* Compact scene creation */}
      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
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

      {/* Blocks */}
      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Add blocks
        </p>

        {!scene ? (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            Select a scene before adding blocks.
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {blockTypes.map((block) => {
              const Icon = block.icon;

              return (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => {
                    if (!scene) return;
                    onAddBlock(scene.id, block.id);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#1557c0]/40 hover:bg-[#f8fbff]"
                >
                  <Icon className="h-3.5 w-3.5 text-[#1557c0]" />
                  {block.label}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}