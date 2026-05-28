import {
  Code2,
  FileText,
  Image,
  List,
  MessageSquareText,
  MousePointerClick,
  MoreHorizontal,
  Sigma,
  Trash2,
  Type,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";

import type {
  AdminSceneBlock,
  AdminSceneDraft,
} from "@/features/admin/papers/types/paper-workspace.types";
import { TiptapTextBlock } from "@/features/admin/studio/components/layout/TiptapTextBlock";

const textCapableBlocks = new Set([
  "heading",
  "paragraph",
  "list",
  "numbered-list",
  "code",
  "callout",
  "quote",
  "caption",
]);

const blockIcons: Record<string, typeof Type> = {
  callout: MessageSquareText,
  checkpoint: MousePointerClick,
  code: Code2,
  formula: Sigma,
  heading: Type,
  image: Image,
  list: List,
  "numbered-list": List,
  paragraph: FileText,
};

const canvasMenuItems = ["Lesson tree", "Notes", "Timer", "JSON"];

function getHorizontalLayout(scene?: AdminSceneDraft) {
  switch (scene?.design?.horizontalAlign) {
    case "left":
      return {
        container: "items-start text-left",
        blocks: "mr-auto",
      };
    case "right":
      return {
        container: "items-end text-right",
        blocks: "ml-auto",
      };
    case "center":
    default:
      return {
        container: "items-center text-center",
        blocks: "mx-auto",
      };
  }
}

function getVerticalLayout(scene?: AdminSceneDraft) {
  switch (scene?.design?.verticalAlign) {
    case "top":
      return "justify-start";
    case "bottom":
      return "justify-end";
    case "center":
    default:
      return "justify-center";
  }
}

function getPreviewBlockText(block: AdminSceneBlock) {
  const text = Array.isArray(block.content)
    ? block.content.join(" ")
    : block.content;

  return text
    .replace(/<li[^>]*>/g, " ")
    .replace(/<\/(p|h1|h2|h3|li|blockquote)>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function getCodeBlockText(block: AdminSceneBlock) {
  const text = Array.isArray(block.content)
    ? block.content.join("\n")
    : block.content;

  return text
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/(p|div|li)>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getBlockItems(block: AdminSceneBlock) {
  if (Array.isArray(block.content)) {
    return block.content.map((item) => item.trim()).filter(Boolean);
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
    return listItems;
  }

  return getPreviewBlockText(block)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function StaticPreviewBlock({
  block,
}: {
  block: AdminSceneBlock;
}) {
  const text = getPreviewBlockText(block) || "Empty block";

  if (block.type === "list") {
    const items = getBlockItems(block);

    return (
      <ul className="mx-auto max-w-xl list-disc space-y-2 pl-6 text-left text-xl font-semibold leading-8 text-foreground/80">
        {items.length ? (
          items.map((item) => <li key={item}>{item}</li>)
        ) : (
          <li>Empty block</li>
        )}
      </ul>
    );
  }

  if (block.type === "numbered-list") {
    const items = getBlockItems(block);

    return (
      <ol className="mx-auto max-w-xl list-decimal space-y-2 pl-6 text-left text-xl font-semibold leading-8 text-foreground/80">
        {items.length ? (
          items.map((item) => <li key={item}>{item}</li>)
        ) : (
          <li>Empty block</li>
        )}
      </ol>
    );
  }

  if (block.type === "callout") {
    return (
      <p className="m-0 rounded-2xl border border-blue-100 bg-white/72 px-5 py-4 text-xl font-semibold leading-8 text-[#123f81] shadow-sm">
        {text}
      </p>
    );
  }

  if (block.type === "code") {
    return (
      <pre className="max-h-64 overflow-auto rounded-2xl bg-slate-950 px-5 py-4 text-left text-sm leading-7 text-white shadow-sm">
        <code>{getCodeBlockText(block) || "Empty block"}</code>
      </pre>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote className="m-0 border-l-4 border-[#1557c0] bg-white/50 px-5 py-3 text-xl font-semibold italic leading-8 text-foreground/75">
        {text}
      </blockquote>
    );
  }

  if (block.type === "heading") {
    return (
      <p className="m-0 text-2xl font-bold leading-9 text-foreground">
        {text}
      </p>
    );
  }

  return (
    <p className="m-0 min-w-[10ch] max-w-full whitespace-pre-line rounded-md px-1 py-0.5 text-xl font-semibold leading-8 text-foreground/80">
      {text}
    </p>
  );
}

function getEditableBlockClass(block: AdminSceneBlock) {
  if (block.type === "callout") {
    return "rounded-2xl border border-blue-100 bg-white/72 px-5 py-4 text-xl font-semibold leading-8 text-[#123f81] shadow-sm";
  }

  if (block.type === "code") {
    return "max-h-64 overflow-auto rounded-2xl bg-slate-950 px-5 py-4 text-left font-mono text-sm leading-7 text-white shadow-sm";
  }

  if (block.type === "quote") {
    return "border-l-4 border-[#1557c0] bg-white/50 px-5 py-3 text-xl font-semibold italic leading-8 text-foreground/75";
  }

  if (block.type === "heading") {
    return "text-2xl font-bold leading-9 text-foreground";
  }

  return "text-xl font-semibold leading-8 text-foreground/80";
}

function SelectableBlock({
  block,
  children,
  onDeleteBlock,
  onSelectBlock,
  selected,
}: {
  block: AdminSceneBlock;
  children: ReactNode;
  onDeleteBlock: (blockId: string) => void;
  onSelectBlock: (blockId: string) => void;
  selected: boolean;
}) {
  const isTextBox = textCapableBlocks.has(block.type);

  function isEditingTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;

    return Boolean(
      target.closest(".ProseMirror") ||
        target.closest("[contenteditable='true']") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select"),
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation();
        onSelectBlock(block.id);
      }}
      onKeyDown={(event) => {
        if (isEditingTarget(event.target)) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectBlock(block.id);
        }
      }}
      className={[
        "relative cursor-text transition",
        isTextBox
          ? "block w-full max-w-full rounded-md p-0"
          : "rounded-xl px-3 py-2",
        selected
          ? isTextBox
            ? "outline outline-2 outline-offset-2 outline-[#8b5cf6]"
            : "bg-[#eaf2ff]/45 outline outline-2 outline-offset-2 outline-[#8b5cf6]"
          : isTextBox
            ? "outline outline-0 outline-transparent hover:outline hover:outline-2 hover:outline-offset-2 hover:outline-[#8b5cf6]/50"
            : "outline outline-0 outline-transparent hover:bg-[#eaf2ff]/35 hover:outline hover:outline-2 hover:outline-offset-2 hover:outline-[#8b5cf6]/45",
      ].join(" ")}
    >
      {selected ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDeleteBlock(block.id);
          }}
          className="absolute -right-3 -top-3 z-20 grid h-7 w-7 place-items-center rounded-full bg-white text-red-500 shadow-lg ring-1 ring-red-100 transition hover:bg-red-50"
          aria-label="Delete text box"
          title="Delete text box"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}

      {children}
    </div>
  );
}

function StudioBlock({
  block,
  onActiveEditorChange,
  onDeleteBlock,
  onSelectBlock,
  onUpdateBlock,
  selected,
}: {
  block: AdminSceneBlock;
  onActiveEditorChange: (editor: Editor | null) => void;
  onDeleteBlock: (blockId: string) => void;
  onSelectBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<AdminSceneBlock>) => void;
  selected: boolean;
}) {
  const Icon = blockIcons[block.type] ?? FileText;
  const selectableProps = {
    block,
    onDeleteBlock,
    onSelectBlock,
    selected,
  };

  if (block.type === "code") {
    return (
      <SelectableBlock {...selectableProps}>
        {selected ? (
          <textarea
            value={getCodeBlockText(block)}
            onClick={(event) => event.stopPropagation()}
            onFocus={() => {
              onActiveEditorChange(null);
              onSelectBlock(block.id);
            }}
            onChange={(event) =>
              onUpdateBlock(block.id, { content: event.target.value })
            }
            className={[
              getEditableBlockClass(block),
              "min-h-40 w-full resize-y whitespace-pre outline-none",
            ].join(" ")}
            spellCheck={false}
            aria-label="Code block text"
          />
        ) : (
          <StaticPreviewBlock block={block} />
        )}
      </SelectableBlock>
    );
  }

  if (textCapableBlocks.has(block.type)) {
    return (
      <SelectableBlock {...selectableProps}>
        {selected ? (
          <TiptapTextBlock
            block={block}
            className={getEditableBlockClass(block)}
            onActiveEditorChange={onActiveEditorChange}
            onSelect={() => onSelectBlock(block.id)}
            onUpdate={(updates) => onUpdateBlock(block.id, updates)}
            previewPlain
          />
        ) : (
          <StaticPreviewBlock block={block} />
        )}
      </SelectableBlock>
    );
  }

  if (block.type === "checkpoint") {
    return (
      <SelectableBlock {...selectableProps}>
        <div className="rounded-2xl bg-amber-50 p-5 text-left text-amber-950 ring-1 ring-amber-100">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
            <Icon className="h-4 w-4" />
            Checkpoint
          </div>
          <p className="mt-3 text-lg font-semibold">
            {getPreviewBlockText(block) || "Empty block"}
          </p>
        </div>
      </SelectableBlock>
    );
  }

  if (block.type === "formula") {
    return (
      <SelectableBlock {...selectableProps}>
        <div className="rounded-2xl bg-slate-950 p-4 text-white">
          <p className="rounded-xl bg-white/10 px-3 py-2 font-mono text-2xl">
            {getPreviewBlockText(block) || "Empty block"}
          </p>
        </div>
      </SelectableBlock>
    );
  }

  if (block.type === "image") {
    return (
      <SelectableBlock {...selectableProps}>
        <div className="rounded-2xl bg-slate-100 p-4 ring-1 ring-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
            <Icon className="h-4 w-4" />
            Image
          </div>
          <div className="mt-3 grid min-h-32 place-items-center rounded-xl bg-white text-center">
            <div>
              <Icon className="mx-auto h-8 w-8 text-[#1557c0]" />
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {getPreviewBlockText(block) || "Empty block"}
              </p>
            </div>
          </div>
        </div>
      </SelectableBlock>
    );
  }

  return (
    <SelectableBlock {...selectableProps}>
      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        {selected ? (
          <TiptapTextBlock
            block={block}
            className={getEditableBlockClass(block)}
            onActiveEditorChange={onActiveEditorChange}
            onSelect={() => onSelectBlock(block.id)}
            onUpdate={(updates) => onUpdateBlock(block.id, updates)}
            previewPlain
          />
        ) : (
          <StaticPreviewBlock block={block} />
        )}
      </div>
    </SelectableBlock>
  );
}

export function StudioCanvas({
  onActiveEditorChange,
  onDeleteBlock,
  onDeselectBlock,
  onSelectBlock,
  onUpdateBlock,
  scene,
  selectedBlockId,
}: {
  onActiveEditorChange: (editor: Editor | null) => void;
  onDeleteBlock: (sceneId: string, blockId: string) => void;
  onDeselectBlock: () => void;
  onSelectBlock: (blockId: string) => void;
  onUpdateBlock: (
    sceneId: string,
    blockId: string,
    updates: Partial<AdminSceneBlock>,
  ) => void;
  scene?: AdminSceneDraft;
  selectedBlockId: string | null;
}) {
  const blocks = scene?.blocks ?? [];
  const horizontalLayout = getHorizontalLayout(scene);
  const verticalLayout = getVerticalLayout(scene);

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f4f7fb]">
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-600">
          <span>Scene</span>
          <span className="text-slate-300">/</span>
          <span className="truncate text-slate-950">
            {scene?.title ?? "Untitled scene"}
          </span>
        </div>
        <div className="min-w-0 flex-1 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Preview order
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
              aria-label="Open canvas menu"
              title="Canvas menu"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
            >
              {canvasMenuItems.map((item) => (
                <DropdownMenu.Item
                  key={item}
                  className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition hover:bg-[#eaf2ff] hover:text-[#1557c0] data-[highlighted]:bg-[#eaf2ff] data-[highlighted]:text-[#1557c0]"
                >
                  {item}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6">
        <div
          className="relative flex aspect-video max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#bfdbfe] bg-white"
          onClick={onDeselectBlock}
        >
          <div
            className={[
              "relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[radial-gradient(circle_at_50%_20%,#dbeafe_0%,#f8fbff_38%,#eef4ff_100%)] p-10",
              horizontalLayout.container,
              verticalLayout,
            ].join(" ")}
          >
            <div className="absolute inset-x-0 top-10 mx-auto h-44 w-44 rounded-full bg-[#1557c0]/10 blur-3xl" />

            <div className="relative w-full max-w-4xl">
              <h1 className="font-serif-paper text-5xl font-semibold text-foreground">
                {scene?.title ?? "Create your first learning scene"}
              </h1>

              {blocks.length > 0 ? (
                <div
                  className={[
                    "mt-8 max-w-2xl space-y-3",
                    horizontalLayout.blocks,
                  ].join(" ")}
                >
                  {blocks.map((block) => (
                    <StudioBlock
                      key={block.id}
                      block={block}
                      onActiveEditorChange={onActiveEditorChange}
                      onDeleteBlock={(blockId) =>
                        scene && onDeleteBlock(scene.id, blockId)
                      }
                      onSelectBlock={onSelectBlock}
                      onUpdateBlock={(blockId, updates) =>
                        scene && onUpdateBlock(scene.id, blockId, updates)
                      }
                      selected={selectedBlockId === block.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-dashed border-blue-200 bg-white/75 p-8 text-center">
                  <p className="text-sm font-semibold text-[#1557c0]">
                    No blocks yet.
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Add content blocks to see the student preview order.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
