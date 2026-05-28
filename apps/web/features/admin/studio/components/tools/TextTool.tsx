"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Code2,
  FileText,
  List,
  ListOrdered,
  MessageSquareText,
  Minus,
  Plus,
  Quote,
} from "lucide-react";

import type {
  AdminSceneBlock,
  AdminSceneDesign,
  AdminSceneDraft,
} from "@/features/admin/papers/types/paper-workspace.types";

const textBlockTypes = [
  {
    description: "A normal text paragraph.",
    icon: FileText,
    label: "Paragraph",
    type: "paragraph",
  },
  {
    description: "A list with bullet points.",
    icon: List,
    label: "Bullet list",
    type: "list",
  },
  {
    description: "A list with numbered points.",
    icon: ListOrdered,
    label: "Numbered list",
    type: "numbered-list",
  },
  {
    description: "Pseudocode or programming code.",
    icon: Code2,
    label: "Code",
    type: "code",
  },
  {
    description: "Important idea shown as learner text.",
    icon: MessageSquareText,
    label: "Key point",
    type: "callout",
  },
  {
    description: "A quoted idea or definition.",
    icon: Quote,
    label: "Quote",
    type: "quote",
  },
] satisfies Array<{
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type: string;
}>;

function blockContentToText(block: AdminSceneBlock) {
  if (Array.isArray(block.content)) {
    return block.content.join("\n");
  }

  if (block.type === "code") {
    return block.content
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<\/(p|div|li)>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const listItems = [...block.content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) =>
      match[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);

  if (listItems.length > 0) {
    return listItems.join("\n");
  }

  return block.content
    .replace(/<li[^>]*>/g, "\n")
    .replace(/<\/(p|h1|h2|h3|li|blockquote)>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function textToBlockContent(block: AdminSceneBlock, value: string) {
  if (block.type === "list" || block.type === "numbered-list") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return value;
}

export function TextTool({
  onAddBlock,
  onUpdateScene,
  onUpdateBlock,
  scene,
  selectedBlockId,
}: {
  onAddBlock: (sceneId: string, blockType: string) => void;
  onUpdateScene: (sceneId: string, updates: Partial<AdminSceneDraft>) => void;
  onUpdateBlock: (
    sceneId: string,
    blockId: string,
    updates: Partial<AdminSceneBlock>,
  ) => void;
  scene?: AdminSceneDraft;
  selectedBlockId: string | null;
}) {
  const selectedBlock = scene?.blocks?.find(
    (block) => block.id === selectedBlockId,
  );
  const canEditSelectedBlock =
    selectedBlock &&
    [
      "paragraph",
      "list",
      "numbered-list",
      "code",
      "callout",
      "quote",
      "caption",
      "heading",
    ].includes(selectedBlock.type);

  function updateSelectedText(value: string) {
    if (!scene || !selectedBlock) return;

    onUpdateBlock(scene.id, selectedBlock.id, {
      content: textToBlockContent(selectedBlock, value),
    });
  }

  function updateSceneTitle(title: string) {
    if (!scene) return;
    onUpdateScene(scene.id, { title });
  }

  function updateLayout(updates: AdminSceneDesign) {
    if (!scene) return;
    onUpdateScene(scene.id, {
      design: {
        ...scene.design,
        ...updates,
      },
    });
  }

  const horizontalAlign = scene?.design?.horizontalAlign ?? "center";
  const verticalAlign = scene?.design?.verticalAlign ?? "center";

  return (
    <div className="space-y-3">
      <section className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Scene text
        </p>

        {!scene ? (
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            Select a scene to edit its title and layout.
          </p>
        ) : (
          <div className="mt-2 space-y-2.5">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">
                Title
              </span>
              <input
                value={scene.title}
                onChange={(event) => updateSceneTitle(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#1557c0] focus:ring-2 focus:ring-[#1557c0]/10"
              />
            </label>

            <div className="grid gap-2">
              <div className="grid grid-cols-[56px_1fr] items-center gap-2">
                <p className="text-xs font-semibold text-slate-600">Align</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { icon: AlignLeft, label: "Left", value: "left" },
                    { icon: AlignCenter, label: "Center", value: "center" },
                    { icon: AlignRight, label: "Right", value: "right" },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = horizontalAlign === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        aria-label={`${item.label} align`}
                        title={item.label}
                        onClick={() =>
                          updateLayout({
                            horizontalAlign:
                              item.value as NonNullable<
                                AdminSceneDesign["horizontalAlign"]
                              >,
                          })
                        }
                        className={[
                          "inline-flex h-8 items-center justify-center rounded-lg border text-xs font-semibold transition",
                          active
                            ? "border-[#1557c0] bg-[#eaf2ff] text-[#1557c0]"
                            : "border-slate-200 text-slate-600 hover:border-[#1557c0]/40 hover:bg-[#eaf2ff]",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-[56px_1fr] items-center gap-2">
                <p className="text-xs font-semibold text-slate-600">Place</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { icon: ArrowUpToLine, label: "Top", value: "top" },
                    { icon: Minus, label: "Middle", value: "center" },
                    {
                      icon: ArrowDownToLine,
                      label: "Bottom",
                      value: "bottom",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = verticalAlign === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        aria-label={`${item.label} position`}
                        title={item.label}
                        onClick={() =>
                          updateLayout({
                            verticalAlign:
                              item.value as NonNullable<
                                AdminSceneDesign["verticalAlign"]
                              >,
                          })
                        }
                        className={[
                          "inline-flex h-8 items-center justify-center rounded-lg border text-xs font-semibold transition",
                          active
                            ? "border-[#1557c0] bg-[#eaf2ff] text-[#1557c0]"
                            : "border-slate-200 text-slate-600 hover:border-[#1557c0]/40 hover:bg-[#eaf2ff]",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Add text
        </p>

        {!scene ? (
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            Select a scene before adding text.
          </p>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {textBlockTypes.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onAddBlock(scene.id, item.type)}
                  className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-left transition hover:border-[#1557c0]/40 hover:bg-[#eaf2ff]"
                  title={item.description}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#eaf2ff] text-[#1557c0]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-slate-900">
                      {item.label}
                    </span>
                  </span>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-[#1557c0]" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Selected text
        </p>

        {!selectedBlock ? (
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            Select a text block on the canvas to edit the words learners will
            see.
          </p>
        ) : canEditSelectedBlock ? (
          <label className="mt-2 block">
            <span className="text-xs font-semibold text-slate-600">
              Learner text
            </span>
            <textarea
              value={blockContentToText(selectedBlock)}
              onChange={(event) => updateSelectedText(event.target.value)}
              rows={
                selectedBlock.type === "list" ||
                selectedBlock.type === "numbered-list"
                  ? 4
                  : selectedBlock.type === "code"
                    ? 6
                  : 5
              }
              className={[
                "mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-5 outline-none focus:border-[#1557c0] focus:ring-2 focus:ring-[#1557c0]/10",
                selectedBlock.type === "code"
                  ? "font-mono"
                  : "",
              ].join(" ")}
            />
          </label>
        ) : (
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            This selected block is not a text block.
          </p>
        )}
      </section>
    </div>
  );
}
