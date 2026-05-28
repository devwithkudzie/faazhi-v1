"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Code2,
  FileQuestion,
  Lightbulb,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import type {
  AdminSceneDraft,
  AdminSceneType,
} from "@/features/admin/papers/types/paper-workspace.types";

const sceneLabels: Record<AdminSceneType, string> = {
  concept: "Concept",
  example: "Example",
  diagram: "Diagram",
  code: "Code",
  checkpoint: "Checkpoint",
  "exam-extract": "Exam extract",
};

const sceneTemplates = [
  {
    type: "concept",
    label: "Concept",
    icon: Lightbulb,
    color: "bg-[#1687f2]",
  },
  {
    type: "example",
    label: "Example",
    icon: BookOpenText,
    color: "bg-[#13a3b7]",
  },
  {
    type: "diagram",
    label: "Diagram",
    icon: BarChart3,
    color: "bg-[#ff5b0a]",
  },
  {
    type: "code",
    label: "Code",
    icon: Code2,
    color: "bg-[#0caf4f]",
  },
  {
    type: "checkpoint",
    label: "Checkpoint",
    icon: MousePointerClick,
    color: "bg-[#ff4057]",
  },
  {
    type: "exam-extract",
    label: "Exam",
    icon: FileQuestion,
    color: "bg-[#d946ef]",
  },
] satisfies Array<{
  type: AdminSceneType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}>;

export function StudioTimeline({
  activeSceneId,
  lessonTitle,
  onCreateScene,
  onDeleteScene,
  onMoveScene,
  onRenameScene,
  onSelectScene,
  scenes,
}: {
  activeSceneId?: string;
  lessonTitle: string;
  onCreateScene: (type: AdminSceneType) => void;
  onDeleteScene: (sceneId: string) => void;
  onMoveScene: (sceneId: string, direction: "up" | "down") => void;
  onRenameScene: (sceneId: string, title: string) => void;
  onSelectScene: (scene: AdminSceneDraft) => void;
  scenes: AdminSceneDraft[];
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const sceneRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!activeSceneId) return;

    sceneRefs.current[activeSceneId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeSceneId]);

  function createScene(type: AdminSceneType) {
    onCreateScene(type);
    setIsCreateOpen(false);
  }

  return (
    <footer className="relative flex h-[128px] shrink-0 items-center gap-4 border-t border-slate-200 bg-white px-5">
      {isCreateOpen ? (
        <div className="absolute bottom-[104px] right-5 z-30 grid w-[560px] grid-cols-3 gap-4 rounded-[26px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.18)] ring-1 ring-slate-200">
          {sceneTemplates.map((template) => {
            const Icon = template.icon;

            return (
              <button
                key={template.type}
                type="button"
                onClick={() => createScene(template.type)}
                className="group flex h-36 flex-col items-center justify-center rounded-2xl bg-white p-4 text-center shadow-[0_12px_30px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
              >
                <span
                  className={[
                    "grid h-16 w-16 place-items-center rounded-full text-white transition group-hover:scale-105",
                    template.color,
                  ].join(" ")}
                >
                  <Icon className="h-8 w-8" />
                </span>

                <span className="mt-4 text-lg font-semibold text-slate-800">
                  {template.label}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            className="group flex h-36 flex-col items-center justify-center rounded-2xl bg-white p-4 text-center shadow-[0_12px_30px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-[#635bff] transition group-hover:scale-105">
              <MoreHorizontal className="h-8 w-8" />
            </span>

            <span className="mt-4 text-lg font-semibold text-slate-800">
              More
            </span>
          </button>
        </div>
      ) : null}

      <div className="w-48 shrink-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          Scene timeline
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-950">
          {lessonTitle}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {scenes.length} scenes
        </p>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto py-2">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            ref={(element) => {
              sceneRefs.current[scene.id] = element;
            }}
            role="button"
            tabIndex={0}
            onClick={() => onSelectScene(scene)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                onSelectScene(scene);
              }
            }}
            className={[
              "relative h-[78px] min-w-44 rounded-2xl border bg-white p-3 text-left transition",
              scene.id === activeSceneId
                ? "border-[#8b5cf6] shadow-[0_0_0_3px_rgba(139,92,246,0.25)]"
                : "border-slate-200 hover:border-blue-200 hover:bg-[#f8fbff]",
            ].join(" ")}
          >
            <span className="absolute bottom-2 left-3 text-sm font-semibold text-slate-950">
              {index + 1}
            </span>

            <p className="truncate text-xs font-semibold text-slate-500">
              {sceneLabels[scene.type]}
            </p>
            <div
              className="absolute right-2 top-2 flex gap-1"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMoveScene(scene.id, "up")}
                className="grid h-5 w-5 place-items-center rounded bg-white/80 text-slate-400 ring-1 ring-slate-200 hover:text-slate-700 disabled:opacity-30"
                title="Move scene left"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                disabled={index === scenes.length - 1}
                onClick={() => onMoveScene(scene.id, "down")}
                className="grid h-5 w-5 place-items-center rounded bg-white/80 text-slate-400 ring-1 ring-slate-200 hover:text-slate-700 disabled:opacity-30"
                title="Move scene right"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = window.prompt("Rename scene", scene.title);
                  if (title?.trim()) onRenameScene(scene.id, title.trim());
                }}
                className="grid h-5 w-5 place-items-center rounded bg-white/80 text-slate-400 ring-1 ring-slate-200 hover:text-slate-700"
                title="Rename scene"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete ${scene.title}?`)) {
                    onDeleteScene(scene.id);
                  }
                }}
                className="grid h-5 w-5 place-items-center rounded bg-white/80 text-rose-400 ring-1 ring-rose-100 hover:text-rose-700"
                title="Delete scene"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}

        <div className="flex h-[78px] min-w-48 overflow-hidden rounded-2xl bg-slate-100">
          <button
            type="button"
            onClick={() => setIsCreateOpen((open) => !open)}
            className="grid flex-1 place-items-center text-slate-950 transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
            aria-label="Add scene"
          >
            <Plus className="h-8 w-8" />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen((open) => !open)}
            className="grid w-20 place-items-center bg-slate-300/70 text-slate-950 transition hover:bg-slate-300"
            aria-label="Open scene templates"
          >
            <ChevronUp
              className={[
                "h-7 w-7 transition",
                isCreateOpen ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>
        </div>
      </div>
    </footer>
  );
}
