import {
  ClipboardList,
  Code2,
  CopyPlus,
  FileText,
  Image,
  List,
  ListChecks,
  MessageSquareText,
  MousePointerClick,
  MoreVertical,
  Plus,
  ScanText,
  Sigma,
  Trash2,
  Type,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { Editor } from "@tiptap/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import type {
  AdminAnswerKind,
  AdminAnswerSlotDraft,
  AdminAssessmentDraft,
  AdminAssessmentPartDraft,
  AdminSceneBlock,
  AdminSceneDraft,
} from "@/features/admin/papers/types/paper-workspace.types";
import {
  createAssessmentDraft,
  normalizeAssessmentDraft,
} from "@/features/admin/papers/services/paper-workspace.service";
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

type AssessmentCanvasTool = "source" | "inputs" | "marking" | "import";
type PartPath = string[];

const answerKindLabels: Record<AdminAnswerKind, string> = {
  short: "Short Answer",
  long: "Long Answer",
  gap: "Gap Fill",
  working: "Working Space",
  code: "Code Editor",
  table: "Table Completion",
  label: "Diagram Label",
  tick: "Tick Box",
  multi_tick: "Multiple Tick",
  true_false: "True / False",
  match: "Matching",
  order: "Ordering",
  classify: "Classification",
  diagram: "Diagram Response",
};

function uniqueCanvasId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createCanvasAnswerSlot(
  kind: AdminAnswerKind = "long",
): AdminAnswerSlotDraft {
  const placeholders: Partial<Record<AdminAnswerKind, string>> = {
    code: "Write Cambridge pseudocode here...",
    long: "Explain your answer using exam wording...",
    short: "e.g. RAM",
    working: "Show each calculation step clearly...",
  };

  return {
    id: uniqueCanvasId("answer"),
    kind,
    label: answerKindLabels[kind],
    lines: kind === "short" ? 1 : 4,
    placeholder: placeholders[kind],
    options:
      kind === "tick" || kind === "multi_tick" || kind === "true_false"
        ? ["Cache memory", "Virtual memory", "Secondary storage"]
        : [],
    columns: kind === "table" ? ["Field", "Purpose"] : [],
    rows: kind === "table" ? 3 : undefined,
    leftItems: kind === "match" ? ["Protocol", "IP address"] : [],
    rightItems: kind === "match" ? ["Rules for communication", "Unique network location"] : [],
    items: kind === "order" || kind === "classify" ? ["Fetch", "Decode", "Execute"] : [],
    categories: kind === "classify" ? ["Input device", "Output device"] : [],
  };
}

function createCanvasMarkPoint() {
  return {
    id: uniqueCanvasId("mark-point"),
    text: "Award one mark for...",
    marks: 1,
    keywords: [],
    acceptedAlternatives: [],
    requiresEvidence: true,
  };
}

function createCanvasPart(label: string): AdminAssessmentPartDraft {
  return {
    id: uniqueCanvasId("part"),
    label,
    prompt: "State one advantage of using a database instead of a flat file.",
    marks: 1,
    answerSlots: [],
    markScheme: [],
    expectedAnswer: "",
    guidance: "",
    subparts: [],
    tags: [],
  };
}

function createCanvasQuestion(number: number) {
  return {
    id: uniqueCanvasId("question"),
    number,
    title: "Database design scenario",
    source: {
      paper: "9618/12",
      session: "May/June 2024",
      questionRef: `Q${number}`,
    },
    context:
      "A school stores student records, subject choices and examination entries in a database.",
    difficulty: "medium" as const,
    tags: ["databases", "data modelling"],
    parts: [createCanvasPart("(a)")],
  };
}

function partLabel(index: number) {
  return `(${String.fromCharCode(97 + index)})`;
}

function subpartLabel(index: number) {
  const numerals = ["i", "ii", "iii", "iv", "v", "vi"];
  return `(${numerals[index] ?? index + 1})`;
}

function updatePartTree(
  parts: AdminAssessmentPartDraft[],
  path: PartPath,
  updater: (part: AdminAssessmentPartDraft) => AdminAssessmentPartDraft,
): AdminAssessmentPartDraft[] {
  const [currentId, ...rest] = path;

  return parts.map((part) => {
    if (part.id !== currentId) return part;
    if (rest.length === 0) return updater(part);

    return {
      ...part,
      subparts: updatePartTree(part.subparts ?? [], rest, updater),
    };
  });
}

function deletePartTree(
  parts: AdminAssessmentPartDraft[],
  path: PartPath,
): AdminAssessmentPartDraft[] {
  const [currentId, ...rest] = path;

  if (rest.length === 0) {
    return parts.filter((part) => part.id !== currentId);
  }

  return parts.map((part) =>
    part.id === currentId
      ? { ...part, subparts: deletePartTree(part.subparts ?? [], rest) }
      : part,
  );
}

function renumberPartTree(
  parts: AdminAssessmentPartDraft[],
  depth = 0,
): AdminAssessmentPartDraft[] {
  return parts.map((part, index) => ({
    ...part,
    label: depth === 0 ? partLabel(index) : subpartLabel(index),
    subparts: renumberPartTree(part.subparts ?? [], depth + 1),
  }));
}

function movePartTree(
  parts: AdminAssessmentPartDraft[],
  path: PartPath,
  direction: "up" | "down",
): AdminAssessmentPartDraft[] {
  const [currentId, ...rest] = path;

  if (rest.length === 0) {
    const index = parts.findIndex((part) => part.id === currentId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= parts.length) return parts;
    const next = [...parts];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    return next;
  }

  return parts.map((part) =>
    part.id === currentId
      ? { ...part, subparts: movePartTree(part.subparts ?? [], rest, direction) }
      : part,
  );
}

function findPartInTree(
  parts: AdminAssessmentPartDraft[],
  path: PartPath,
): AdminAssessmentPartDraft | undefined {
  const [currentId, ...rest] = path;
  const part = parts.find((candidate) => candidate.id === currentId);
  if (!part || rest.length === 0) return part;
  return findPartInTree(part.subparts ?? [], rest);
}

function totalPartMarks(parts: AdminAssessmentPartDraft[]): number {
  return parts.reduce(
    (total, part) =>
      total + part.marks + totalPartMarks(part.subparts ?? []),
    0,
  );
}

function EditableSceneTitle({
  onRename,
  title,
}: {
  onRename: (title: string) => void;
  title: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextBlurRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function commitEdit() {
    const nextTitle = draftTitle.trim();

    if (nextTitle && nextTitle !== title) {
      onRename(nextTitle);
    }

    setIsEditing(false);
  }

  function cancelEdit() {
    skipNextBlurRef.current = true;
    setDraftTitle(title);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        aria-label="Scene title"
        value={draftTitle}
        onBlur={() => {
          if (skipNextBlurRef.current) {
            skipNextBlurRef.current = false;
            return;
          }

          commitEdit();
        }}
        onChange={(event) => setDraftTitle(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            cancelEdit();
          }
        }}
        className="w-full rounded-lg border border-blue-200 bg-white/80 px-2 py-1 font-serif-paper text-5xl font-semibold text-foreground outline-none transition placeholder:text-slate-300 focus:border-[#1557c0] focus:ring-4 focus:ring-[#1557c0]/10"
      />
    );
  }

  return (
    <button
      type="button"
      aria-label="Edit scene title"
      onClick={(event) => {
        event.stopPropagation();
        setDraftTitle(title);
        setIsEditing(true);
      }}
      className="group max-w-full rounded-lg px-1 py-0.5 text-inherit transition hover:bg-white/55"
    >
      <span>{title}</span>
      <span
        aria-hidden="true"
        className="ml-2 text-slate-400 opacity-0 transition group-hover:opacity-100"
      >
        |
      </span>
    </button>
  );
}

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

function AnswerSlotPreview({ slot }: { slot: AdminAnswerSlotDraft }) {
  if (slot.kind === "table") {
    const columns = slot.columns?.length ? slot.columns : ["Column 1", "Column 2"];
    const rows = Array.from({ length: Math.max(1, slot.rows ?? 3) });

    return (
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-300">
        <div
          className="grid bg-slate-100 text-[11px] font-semibold text-slate-600"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((column) => (
            <div key={column} className="border-r border-slate-300 px-2 py-1 last:border-r-0">
              {column}
            </div>
          ))}
        </div>
        {rows.map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid border-t border-slate-300"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((column) => (
              <div key={`${rowIndex}-${column}`} className="h-9 border-r border-slate-300 last:border-r-0" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (["tick", "multi_tick", "true_false"].includes(slot.kind)) {
    const options = slot.options?.length ? slot.options : ["Option"];

    return (
      <div className="mt-3 space-y-2">
        {options.map((option) => (
          <div key={option} className="flex items-center gap-2 text-sm text-slate-800">
            <span className="grid h-4 w-4 place-items-center border border-slate-400 bg-white" />
            <span>{option}</span>
          </div>
        ))}
      </div>
    );
  }

  if (slot.kind === "code") {
    return (
      <div className="mt-3 rounded-lg border border-slate-300 bg-slate-950 p-3 font-mono text-xs leading-6 text-slate-400">
        {Array.from({ length: Math.max(4, slot.lines ?? 6) }).map((_, index) => (
          <div key={index} className="border-b border-white/10 py-0.5">
            &nbsp;
          </div>
        ))}
      </div>
    );
  }

  if (slot.kind === "diagram") {
    return (
      <div className="mt-3 grid h-36 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs font-semibold text-slate-400">
        Diagram answer space
      </div>
    );
  }

  if (slot.kind === "match") {
    const left = slot.leftItems?.length ? slot.leftItems : ["Item A", "Item B"];
    const right = slot.rightItems?.length ? slot.rightItems : ["Match 1", "Match 2"];

    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="space-y-2">
          {left.map((item) => (
            <div key={item} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {item}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((item) => (
            <div key={item} className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm">
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slot.kind === "order") {
    const items = slot.items?.length ? slot.items : ["Step 1", "Step 2", "Step 3"];

    return (
      <ol className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={item} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-xs font-bold">
              {index + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>
    );
  }

  if (slot.kind === "classify") {
    const categories = slot.categories?.length ? slot.categories : ["Category A", "Category B"];
    const items = slot.items?.length ? slot.items : ["Item 1", "Item 2"];

    return (
      <div className="mt-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {item}
            </span>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {categories.map((category) => (
            <div key={category} className="min-h-20 rounded-lg border border-dashed border-slate-300 p-2 text-xs font-semibold text-slate-500">
              {category}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {Array.from({ length: Math.max(1, slot.lines ?? 3) }).map((_, index) => (
        <div key={index} className="h-7 border-b border-slate-300" />
      ))}
    </div>
  );
}

function AssessmentFloatingToolbar({
  assessment,
  onAddSubpart,
  onAssessmentChange,
  onDeletePart,
  onMovePart,
  part,
  partPath,
  questionId,
}: {
  assessment: AdminAssessmentDraft;
  onAddSubpart?: () => void;
  onAssessmentChange?: (assessment: AdminAssessmentDraft) => void;
  onDeletePart?: () => void;
  onMovePart?: (direction: "up" | "down") => void;
  part?: AdminAssessmentPartDraft;
  partPath?: PartPath;
  questionId?: string;
}) {
  const [tool, setTool] = useState<AssessmentCanvasTool | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [markingOpen, setMarkingOpen] = useState(false);
  const canEdit = Boolean(
    onAssessmentChange && part && questionId && partPath && partPath.length > 0,
  );

  function updatePart(updater: (part: AdminAssessmentPartDraft) => AdminAssessmentPartDraft) {
    if (!onAssessmentChange || !part || !questionId || !partPath) return;

    onAssessmentChange({
      ...assessment,
      questions: assessment.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              parts: updatePartTree(question.parts, partPath, updater),
            }
          : question,
      ),
    });
  }

  function updateAssessment(updates: Partial<AdminAssessmentDraft>) {
    onAssessmentChange?.({ ...assessment, ...updates });
  }

  function importPrompt() {
    const prompt = pasteText.trim();
    if (!prompt || !canEdit) return;

    const marksMatch = prompt.match(/\[(\d+)\]|\((\d+)\s*marks?\)/i);
    const marks = Number(marksMatch?.[1] ?? marksMatch?.[2] ?? part?.marks ?? 1);

    updatePart((current) => ({
      ...current,
      prompt,
      marks: Number.isFinite(marks) && marks > 0 ? marks : current.marks,
      answerSlots:
        current.answerSlots.length > 0
          ? current.answerSlots
          : [createCanvasAnswerSlot(prompt.match(/pseudocode|code/i) ? "code" : "long")],
      markScheme:
        current.markScheme.length > 0
          ? current.markScheme
          : Array.from({ length: Math.max(1, Math.min(marks || 1, 8)) }).map(
              () => createCanvasMarkPoint(),
            ),
    }));
    setPasteText("");
    setTool(null);
  }

  const toolItems = [
    { id: "source" as const, label: "Source", icon: ClipboardList },
    { id: "inputs" as const, label: "Inputs", icon: CopyPlus },
    { id: "marking" as const, label: "Marking", icon: ListChecks },
    { id: "import" as const, label: "Import", icon: ScanText },
  ];

  return (
    <>
      <aside className="absolute right-4 top-24 z-20 flex flex-col items-center gap-2 rounded-2xl bg-white/95 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-slate-200 backdrop-blur">
        {toolItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "marking") {
                  setMarkingOpen(true);
                  setTool(null);
                  return;
                }

                setTool((current) => (current === item.id ? null : item.id));
              }}
              className={[
                "grid h-14 w-14 place-items-center rounded-xl text-[10px] font-bold transition",
                tool === item.id
                  ? "bg-[#1557c0] text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>

      {tool ? (
        <div className="absolute right-24 top-24 z-20 w-72 rounded-2xl bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.18)] ring-1 ring-slate-200">
          {tool === "source" ? (
            <div className="space-y-2">
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Assessment title
                </span>
                <input
                  value={assessment.title}
                  onChange={(event) => updateAssessment({ title: event.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs font-semibold outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Selected part
                </span>
                <div className="rounded-lg bg-slate-50 p-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {part ? `${part.label} · ${part.marks} marks` : "Click a prompt"}
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Marks
                </span>
                <input
                  value={part?.marks ?? ""}
                  disabled={!canEdit}
                  onChange={(event) =>
                    updatePart((current) => ({
                      ...current,
                      marks: Number(event.target.value) || 1,
                    }))
                  }
                  className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs font-semibold outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={part?.topic ?? ""}
                  disabled={!canEdit}
                  placeholder="Topic"
                  onChange={(event) =>
                    updatePart((current) => ({
                      ...current,
                      topic: event.target.value,
                    }))
                  }
                  className="h-9 rounded-lg border border-slate-200 px-2 text-xs font-semibold outline-none placeholder:text-slate-400 focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
                <input
                  value={(part?.tags ?? []).join(", ")}
                  disabled={!canEdit}
                  placeholder="Tags"
                  onChange={(event) =>
                    updatePart((current) => ({
                      ...current,
                      tags: event.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    }))
                  }
                  className="h-9 rounded-lg border border-slate-200 px-2 text-xs font-semibold outline-none placeholder:text-slate-400 focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>
              <textarea
                value={part?.expectedAnswer ?? ""}
                disabled={!canEdit}
                rows={4}
                placeholder="Expected answer, e.g. The candidate should explain that primary keys uniquely identify records."
                onChange={(event) =>
                  updatePart((current) => ({
                    ...current,
                    expectedAnswer: event.target.value,
                  }))
                }
                className="w-full resize-y rounded-lg border border-slate-200 px-2 py-2 text-xs leading-5 outline-none placeholder:text-slate-400 focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={!canEdit || !onAddSubpart}
                  onClick={onAddSubpart}
                  className="h-9 rounded-lg bg-[#eaf2ff] text-xs font-bold text-[#1557c0] transition hover:bg-blue-100 disabled:opacity-40"
                >
                  Add sub-part
                </button>
                <button
                  type="button"
                  disabled={!canEdit || !onDeletePart}
                  onClick={onDeletePart}
                  className="h-9 rounded-lg bg-rose-50 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-40"
                >
                  Delete part
                </button>
                <button
                  type="button"
                  disabled={!canEdit || !onMovePart}
                  onClick={() => onMovePart?.("up")}
                  className="h-9 rounded-lg bg-slate-50 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:text-[#1557c0] disabled:opacity-40"
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={!canEdit || !onMovePart}
                  onClick={() => onMovePart?.("down")}
                  className="h-9 rounded-lg bg-slate-50 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:text-[#1557c0] disabled:opacity-40"
                >
                  Move down
                </button>
              </div>
            </div>
          ) : null}

          {tool === "inputs" ? (
          <div className="space-y-2">
            <select
              disabled={!canEdit}
              defaultValue=""
              onChange={(event) => {
                const kind = event.target.value as AdminAnswerKind;
                if (!kind) return;
                updatePart((current) => ({
                  ...current,
                  answerSlots: [
                    ...current.answerSlots,
                    createCanvasAnswerSlot(kind),
                  ],
                }));
                event.currentTarget.value = "";
              }}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100 disabled:opacity-40"
            >
              <option value="">Choose response type...</option>
              {(Object.keys(answerKindLabels) as AdminAnswerKind[]).map((kind) => (
                <option key={kind} value={kind}>
                  {answerKindLabels[kind]}
                </option>
              ))}
            </select>
            <div className="space-y-1">
              {(part?.answerSlots ?? []).map((slot) => (
                <div
                  key={slot.id}
                  className="grid gap-1 rounded-lg bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="capitalize">{answerKindLabels[slot.kind]}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updatePart((current) => ({
                          ...current,
                          answerSlots: current.answerSlots.filter(
                            (candidate) => candidate.id !== slot.id,
                          ),
                        }))
                      }
                      className="text-slate-400 hover:text-rose-600"
                      aria-label="Remove answer input"
                      title="Remove answer input"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {["long", "working", "code"].includes(slot.kind) ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                        Lines
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updatePart((current) => ({
                            ...current,
                            answerSlots: current.answerSlots.map((candidate) =>
                              candidate.id === slot.id
                                ? {
                                    ...candidate,
                                    lines: Math.max(1, (candidate.lines ?? 4) - 1),
                                  }
                                : candidate,
                            ),
                          }))
                        }
                        className="grid h-6 w-6 place-items-center rounded bg-white ring-1 ring-slate-200"
                      >
                        -
                      </button>
                      <span>{slot.lines ?? 4}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updatePart((current) => ({
                            ...current,
                            answerSlots: current.answerSlots.map((candidate) =>
                              candidate.id === slot.id
                                ? {
                                    ...candidate,
                                    lines: (candidate.lines ?? 4) + 1,
                                  }
                                : candidate,
                            ),
                          }))
                        }
                        className="grid h-6 w-6 place-items-center rounded bg-white ring-1 ring-slate-200"
                      >
                        +
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tool === "marking" ? (
          null
        ) : null}

        {tool === "import" ? (
          <div className="space-y-2">
            <textarea
              value={pasteText}
              rows={7}
              onChange={(event) => setPasteText(event.target.value)}
              placeholder="Paste a question-paper extract. It will replace the selected part prompt."
              className="w-full resize-none rounded-lg border border-slate-200 px-2 py-2 text-xs leading-5 outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="button"
              disabled={!canEdit || !pasteText.trim()}
              onClick={importPrompt}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#1557c0] text-xs font-bold text-white transition hover:bg-[#124cad] disabled:opacity-40"
            >
              <ScanText className="h-3.5 w-3.5" />
              Extract into prompt
            </button>
          </div>
        ) : null}
        </div>
      ) : null}

      {markingOpen ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/35 px-6">
          <div className="max-h-[82vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1557c0]">
                  Marking scheme
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  {part ? `${part.label} · ${part.marks} marks` : "Select a part"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMarkingOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <div className="max-h-[62vh] space-y-3 overflow-auto p-5">
              <button
                type="button"
                disabled={!canEdit}
                onClick={() =>
                  updatePart((current) => ({
                    ...current,
                    markScheme: [...current.markScheme, createCanvasMarkPoint()],
                  }))
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1557c0] px-4 text-sm font-bold text-white transition hover:bg-[#124cad] disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                Add mark point
              </button>

              {(part?.markScheme ?? []).map((markPoint, index) => (
                <div
                  key={markPoint.id}
                  className="grid gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Point {index + 1}
                    </span>
                    <input
                      value={markPoint.marks}
                      onChange={(event) =>
                        updatePart((current) => ({
                          ...current,
                          markScheme: current.markScheme.map((candidate) =>
                            candidate.id === markPoint.id
                              ? {
                                  ...candidate,
                                  marks: Number(event.target.value) || 1,
                                }
                              : candidate,
                          ),
                        }))
                      }
                      className="h-8 w-16 rounded-lg border border-slate-200 px-2 text-xs font-bold outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <textarea
                    value={markPoint.text}
                    rows={3}
                    onChange={(event) =>
                      updatePart((current) => ({
                        ...current,
                        markScheme: current.markScheme.map((candidate) =>
                          candidate.id === markPoint.id
                            ? { ...candidate, text: event.target.value }
                            : candidate,
                        ),
                      }))
                    }
                    className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
                  />
                  <input
                    value={(markPoint.keywords ?? []).join(", ")}
                    placeholder="Keywords, comma separated"
                    onChange={(event) =>
                      updatePart((current) => ({
                        ...current,
                        markScheme: current.markScheme.map((candidate) =>
                          candidate.id === markPoint.id
                            ? {
                                ...candidate,
                                keywords: event.target.value
                                  .split(",")
                                  .map((keyword) => keyword.trim())
                                  .filter(Boolean),
                              }
                            : candidate,
                        ),
                      }))
                    }
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AssessmentCanvasPreview({
  assessment,
  label,
  onAssessmentChange,
}: {
  assessment?: AdminAssessmentDraft;
  label?: string;
  onAssessmentChange?: (assessment: AdminAssessmentDraft) => void;
}) {
  const [selectedPartKey, setSelectedPartKey] = useState<string | null>(null);
  const totalMarks =
    assessment?.questions.reduce(
      (total, question) => total + totalPartMarks(question.parts),
      0,
    ) ?? 0;
  const firstQuestion = assessment?.questions[0];
  const firstPart = firstQuestion?.parts[0];
  const selectedQuestionId = selectedPartKey?.split(":")[0];
  const selectedPath = selectedPartKey?.split(":")[1]?.split("/").filter(Boolean) ?? [];
  const selectedQuestion =
    assessment?.questions.find((question) => question.id === selectedQuestionId) ??
    firstQuestion;
  const selectedQuestionOnly = Boolean(
    selectedPartKey && selectedQuestion && selectedPath.length === 0,
  );
  const selectedPart = selectedPath.length > 0 && selectedQuestion
    ? findPartInTree(selectedQuestion.parts, selectedPath) ?? firstPart
    : selectedPartKey
      ? undefined
      : firstPart;

  function selectQuestion(questionId: string) {
    setSelectedPartKey(`${questionId}:`);
  }

  function selectPart(questionId: string, path: PartPath) {
    setSelectedPartKey(`${questionId}:${path.join("/")}`);
  }

  function updatePartPrompt(
    questionId: string,
    path: PartPath,
    prompt: string,
  ) {
    if (!assessment || !onAssessmentChange) return;

    onAssessmentChange({
      ...assessment,
      questions: assessment.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              parts: updatePartTree(question.parts, path, (part) => ({
                ...part,
                prompt,
              })),
            }
          : question,
      ),
    });
  }

  function updateQuestionText(
    questionId: string,
    updates: {
      context?: string;
      title?: string;
    },
  ) {
    if (!assessment || !onAssessmentChange) return;

    onAssessmentChange({
      ...assessment,
      questions: assessment.questions.map((question) =>
        question.id === questionId ? { ...question, ...updates } : question,
      ),
    });
  }

  function updatePart(
    questionId: string,
    path: PartPath,
    updater: (part: AdminAssessmentPartDraft) => AdminAssessmentPartDraft,
  ) {
    if (!assessment || !onAssessmentChange) return;

    onAssessmentChange({
      ...assessment,
      questions: assessment.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              parts: updatePartTree(question.parts, path, updater),
            }
          : question,
      ),
    });
  }

  function addQuestion() {
    if (!assessment || !onAssessmentChange) return;
    const question = createCanvasQuestion(assessment.questions.length + 1);
    onAssessmentChange({
      ...assessment,
      questions: [...assessment.questions, question],
    });
    selectPart(question.id, [question.parts[0].id]);
  }

  function moveQuestion(questionId: string, direction: "up" | "down") {
    if (!assessment || !onAssessmentChange) return;
    const index = assessment.questions.findIndex((question) => question.id === questionId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= assessment.questions.length) return;
    const questions = [...assessment.questions];
    [questions[index], questions[targetIndex]] = [questions[targetIndex], questions[index]];
    onAssessmentChange({
      ...assessment,
      questions: questions.map((question, questionIndex) => ({
        ...question,
        number: questionIndex + 1,
      })),
    });
  }

  function deleteQuestion(questionId: string) {
    if (!assessment || !onAssessmentChange) return;
    const deletedIndex = assessment.questions.findIndex(
      (question) => question.id === questionId,
    );
    const questions = assessment.questions
      .filter((question) => question.id !== questionId)
      .map((question, index) => ({ ...question, number: index + 1 }));

    onAssessmentChange({
      ...assessment,
      questions,
    });

    const replacement = questions[Math.min(Math.max(deletedIndex, 0), questions.length - 1)];
    if (replacement) {
      selectQuestion(replacement.id);
      return;
    }

    setSelectedPartKey(null);
  }

  function addPart(questionId: string) {
    if (!assessment || !onAssessmentChange) return;
    const question = assessment.questions.find((item) => item.id === questionId);
    if (!question) return;
    const part = createCanvasPart(partLabel(question.parts.length));
    onAssessmentChange({
      ...assessment,
      questions: assessment.questions.map((item) =>
        item.id === questionId
          ? { ...item, parts: [...item.parts, part] }
          : item,
      ),
    });
    selectPart(questionId, [part.id]);
  }

  function addSubpart(questionId: string, path: PartPath) {
    const parent = selectedQuestion
      ? findPartInTree(selectedQuestion.parts, path)
      : undefined;
    const subpart = createCanvasPart(subpartLabel(parent?.subparts?.length ?? 0));
    updatePart(questionId, path, (part) => ({
      ...part,
      subparts: renumberPartTree([...(part.subparts ?? []), subpart], 1),
    }));
    selectPart(questionId, [...path, subpart.id]);
  }

  function movePart(questionId: string, path: PartPath, direction: "up" | "down") {
    if (!assessment || !onAssessmentChange) return;
    onAssessmentChange({
      ...assessment,
      questions: assessment.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              parts: renumberPartTree(
                movePartTree(question.parts, path, direction),
              ),
            }
          : question,
      ),
    });
  }

  function deletePart(questionId: string, path: PartPath) {
    if (!assessment || !onAssessmentChange) return;
    const parentPath = path.slice(0, -1);
    let nextQuestionParts: AdminAssessmentPartDraft[] = [];

    onAssessmentChange({
      ...assessment,
      questions: assessment.questions.map((question) =>
        question.id === questionId
          ? (() => {
              nextQuestionParts = renumberPartTree(
                deletePartTree(question.parts, path),
              );
              return { ...question, parts: nextQuestionParts };
            })()
          : question,
      ),
    });

    if (parentPath.length > 0) {
      selectPart(questionId, parentPath);
      return;
    }

    if (nextQuestionParts[0]) {
      selectPart(questionId, [nextQuestionParts[0].id]);
      return;
    }

    selectQuestion(questionId);
  }

  function deleteSelected() {
    if (!selectedQuestion) return;

    if (selectedPath.length > 0) {
      deletePart(selectedQuestion.id, selectedPath);
      return;
    }

    deleteQuestion(selectedQuestion.id);
  }

  function renderPart(
    questionId: string,
    part: AdminAssessmentPartDraft,
    path: PartPath,
    depth = 0,
  ): ReactNode {
    const selected = `${questionId}:${path.join("/")}` === selectedPartKey;

    return (
      <div key={part.id} className="space-y-3" style={{ marginLeft: depth * 28 }}>
        <div
          onClick={(event) => {
            event.stopPropagation();
            selectPart(questionId, path);
          }}
          className={[
            "grid grid-cols-[52px_1fr_56px] gap-3 rounded-lg p-2 transition",
            selected ? "bg-blue-50/55" : "hover:bg-slate-50/70",
          ].join(" ")}
        >
          <div className="pt-0.5">
            <span className="block w-full px-0 py-0.5 text-sm font-bold text-slate-900">
              {part.label}
            </span>
          </div>

          <div>
            <textarea
              value={part.prompt}
              rows={Math.max(2, part.prompt.split("\n").length)}
              placeholder={
                depth === 0
                  ? "Describe the task for this part, e.g. Explain why the database should use a primary key."
                  : "Describe this sub-part, e.g. State one validation check that could be used."
              }
              onFocus={() => selectPart(questionId, path)}
              onChange={(event) =>
                updatePartPrompt(questionId, path, event.target.value)
              }
              className="w-full resize-y bg-transparent px-0 py-0.5 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-300 hover:bg-blue-50/45 focus:bg-blue-50/70"
              aria-label={`Edit prompt ${part.label}`}
            />

            {part.answerSlots.map((slot) => (
              <div key={slot.id} className="group relative">
                {slot.label ? (
                  <p className="mt-4 text-xs font-semibold text-slate-500">
                    {slot.label}
                  </p>
                ) : null}
                <AnswerSlotPreview slot={slot} />
                {selected ? (
                  <button
                    type="button"
                    onClick={() =>
                      updatePart(questionId, path, (current) => ({
                        ...current,
                        answerSlots: current.answerSlots.filter(
                          (candidate) => candidate.id !== slot.id,
                        ),
                      }))
                    }
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-slate-400 opacity-0 shadow ring-1 ring-slate-200 transition hover:text-rose-600 group-hover:opacity-100"
                    aria-label="Delete answer input"
                    title="Delete answer input"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ))}

            {selected ? (
              <button
                type="button"
                onClick={() => addSubpart(questionId, path)}
                className="mt-3 rounded-lg bg-[#eaf2ff] px-3 py-2 text-xs font-bold text-[#1557c0] transition hover:bg-blue-100"
              >
                Add Sub-part
              </button>
            ) : null}
          </div>

          <div>
            <input
              value={part.marks}
              onChange={(event) =>
                updatePart(questionId, path, (current) => ({
                  ...current,
                  marks: Number(event.target.value) || 0,
                }))
              }
              className="w-full bg-transparent px-0 py-0.5 text-right text-sm font-bold text-slate-500 outline-none transition hover:bg-blue-50/50 focus:bg-blue-50/70"
              aria-label={`Edit marks for ${part.label}`}
            />
          </div>
        </div>

        {(part.subparts ?? []).length > 0 ? (
          <div className="space-y-3 border-l border-slate-200 pl-3">
            {(part.subparts ?? []).map((subpart) =>
              renderPart(questionId, subpart, [...path, subpart.id], depth + 1),
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f4f7fb]">
      {assessment ? (
        <AssessmentFloatingToolbar
          assessment={assessment}
          onAddSubpart={
            selectedQuestion && selectedPath.length > 0
              ? () => addSubpart(selectedQuestion.id, selectedPath)
              : undefined
          }
          onAssessmentChange={onAssessmentChange}
          onDeletePart={
            selectedQuestion && selectedPath.length > 0
              ? () => deletePart(selectedQuestion.id, selectedPath)
              : undefined
          }
          onMovePart={
            selectedQuestion && selectedPath.length > 0
              ? (direction) => movePart(selectedQuestion.id, selectedPath, direction)
              : undefined
          }
          part={selectedPart}
          partPath={selectedPath}
          questionId={selectedQuestion?.id}
        />
      ) : null}

      <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Assessment canvas
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-slate-950">
            {label ?? assessment?.title ?? "Assessment"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {selectedPartKey && selectedQuestion ? (
            <button
              type="button"
              onClick={deleteSelected}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-rose-50 px-3 text-xs font-bold text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete selected
            </button>
          ) : null}
          <div className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-bold text-[#1557c0]">
            {totalMarks} marks
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl bg-white px-12 py-10 shadow-[0_20px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
          {assessment ? (
            <>
              <div className="border-b border-slate-200 pb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {assessment.scope === "module" ? "Module assessment" : "Topical assessment"}
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-950">
                  {assessment.title}
                </h1>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {assessment.durationMinutes ?? 20} minutes · {totalMarks} marks
                </p>
              </div>

              <div className="mt-8 space-y-10">
                {assessment.questions.map((question) => (
                  <section
                    key={question.id}
                    onClick={() => selectQuestion(question.id)}
                    className={[
                      "break-inside-avoid rounded-2xl border bg-white p-6 shadow-sm transition",
                      selectedQuestionOnly && selectedQuestion?.id === question.id
                        ? "border-[#1557c0] ring-4 ring-blue-100"
                        : "border-slate-200",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <label className="min-w-0 flex-1">
                            <span className="block text-xl font-bold text-slate-950">
                              Question {question.number}
                            </span>
                            <input
                              value={question.title}
                              onChange={(event) =>
                                updateQuestionText(question.id, {
                                  title: event.target.value,
                                })
                              }
                              placeholder="Short internal title, e.g. Database design scenario"
                              className="mt-1 w-full bg-transparent px-0 py-0.5 text-sm font-semibold text-slate-500 outline-none transition placeholder:text-slate-300 hover:bg-blue-50/45 focus:bg-blue-50/70"
                              aria-label={`Edit question ${question.number} title`}
                            />
                          </label>
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-4">
                          <input
                            value={question.source?.paper ?? ""}
                            placeholder="9618/12"
                            onChange={(event) =>
                              onAssessmentChange?.({
                                ...assessment,
                                questions: assessment.questions.map((item) =>
                                  item.id === question.id
                                    ? {
                                        ...item,
                                        source: {
                                          ...item.source,
                                          paper: event.target.value,
                                        },
                                      }
                                    : item,
                                ),
                              })
                            }
                            className="h-8 bg-transparent px-0 text-xs font-semibold text-slate-500 outline-none transition placeholder:text-slate-300 hover:bg-blue-50/45 focus:bg-blue-50/70"
                          />
                          <input
                            value={question.source?.session ?? ""}
                            placeholder="May/June 2024"
                            onChange={(event) =>
                              onAssessmentChange?.({
                                ...assessment,
                                questions: assessment.questions.map((item) =>
                                  item.id === question.id
                                    ? {
                                        ...item,
                                        source: {
                                          ...item.source,
                                          session: event.target.value,
                                        },
                                      }
                                    : item,
                                ),
                              })
                            }
                            className="h-8 bg-transparent px-0 text-xs font-semibold text-slate-500 outline-none transition placeholder:text-slate-300 hover:bg-blue-50/45 focus:bg-blue-50/70"
                          />
                          <input
                            value={question.source?.questionRef ?? ""}
                            placeholder="Q4(b)"
                            onChange={(event) =>
                              onAssessmentChange?.({
                                ...assessment,
                                questions: assessment.questions.map((item) =>
                                  item.id === question.id
                                    ? {
                                        ...item,
                                        source: {
                                          ...item.source,
                                          questionRef: event.target.value,
                                        },
                                      }
                                    : item,
                                ),
                              })
                            }
                            className="h-8 bg-transparent px-0 text-xs font-semibold text-slate-500 outline-none transition placeholder:text-slate-300 hover:bg-blue-50/45 focus:bg-blue-50/70"
                          />
                          <input
                            value={(question.tags ?? []).join(", ")}
                            placeholder="databases, SQL"
                            onChange={(event) =>
                              onAssessmentChange?.({
                                ...assessment,
                                questions: assessment.questions.map((item) =>
                                  item.id === question.id
                                    ? {
                                        ...item,
                                        tags: event.target.value
                                          .split(",")
                                          .map((tag) => tag.trim())
                                          .filter(Boolean),
                                      }
                                    : item,
                                ),
                              })
                            }
                            className="h-8 bg-transparent px-0 text-xs font-semibold text-slate-500 outline-none transition placeholder:text-slate-300 hover:bg-blue-50/45 focus:bg-blue-50/70"
                          />
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => moveQuestion(question.id, "up")}
                          className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:text-[#1557c0]"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(question.id, "down")}
                          className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:text-[#1557c0]"
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteQuestion(question.id)}
                          className="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 ring-1 ring-rose-100 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <textarea
                        value={question.context ?? ""}
                        rows={Math.max(2, (question.context ?? "").split("\n").length)}
                        placeholder="A library stores details about books, members and loans in a database. The librarian needs to search for overdue books and produce reports for each member."
                        onChange={(event) =>
                          updateQuestionText(question.id, {
                            context: event.target.value,
                          })
                        }
                        className="min-h-16 w-full resize-y bg-transparent p-0 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 hover:bg-blue-50/45 focus:bg-blue-50/70"
                        aria-label={`Edit question ${question.number} main prompt`}
                      />
                    </div>

                    <div className="mt-5 space-y-4">
                      {question.parts.map((part) =>
                        renderPart(question.id, part, [part.id]),
                      )}
                      <button
                        type="button"
                        onClick={() => addPart(question.id)}
                        className="rounded-lg bg-[#eaf2ff] px-3 py-2 text-xs font-bold text-[#1557c0] transition hover:bg-blue-100"
                      >
                        Add Part
                      </button>
                    </div>
                  </section>
                ))}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="rounded-xl bg-[#1557c0] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#124cad]"
                >
                  Add Question
                </button>
              </div>
            </>
          ) : (
            <div className="grid min-h-96 place-items-center text-center">
              <div>
                <FileText className="mx-auto h-10 w-10 text-[#1557c0]" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Choose an assessment from the Assess tab.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function CheckpointSceneCanvas({
  onAssessmentChange,
  scene,
}: {
  onAssessmentChange?: (assessment: AdminAssessmentDraft) => void;
  scene: AdminSceneDraft;
}) {
  const assessment = normalizeAssessmentDraft(
    scene.assessment ?? createAssessmentDraft("embedded", scene.title || "Checkpoint"),
    "embedded",
    scene.title || "Checkpoint",
  );

  return (
    <AssessmentCanvasPreview
      assessment={assessment}
      label="Embedded checkpoint"
      onAssessmentChange={(nextAssessment) => {
        onAssessmentChange?.(
          normalizeAssessmentDraft(
            {
              ...nextAssessment,
              title: nextAssessment.title || scene.title || "Checkpoint",
            },
            "embedded",
            scene.title || "Checkpoint",
          ),
        );
      }}
    />
  );
}

export function StudioCanvas({
  assessment,
  assessmentLabel,
  canvasMode,
  lessonTitle,
  onAssessmentChange,
  onActiveEditorChange,
  onDeleteBlock,
  onDeselectBlock,
  onRenameScene,
  onUpdateSceneAssessment,
  onSelectBlock,
  onUpdateBlock,
  scene,
  selectedBlockId,
  topicTitle,
}: {
  assessment?: AdminAssessmentDraft;
  assessmentLabel?: string;
  canvasMode: "scene" | "assessment";
  lessonTitle?: string;
  onAssessmentChange?: (assessment: AdminAssessmentDraft) => void;
  onActiveEditorChange: (editor: Editor | null) => void;
  onDeleteBlock: (sceneId: string, blockId: string) => void;
  onDeselectBlock: () => void;
  onRenameScene: (sceneId: string, title: string) => void;
  onUpdateSceneAssessment?: (
    sceneId: string,
    assessment: AdminAssessmentDraft,
  ) => void;
  onSelectBlock: (blockId: string) => void;
  onUpdateBlock: (
    sceneId: string,
    blockId: string,
    updates: Partial<AdminSceneBlock>,
  ) => void;
  scene?: AdminSceneDraft;
  selectedBlockId: string | null;
  topicTitle?: string;
}) {
  if (canvasMode === "assessment") {
    return (
      <AssessmentCanvasPreview
        assessment={assessment}
        label={assessmentLabel}
        onAssessmentChange={onAssessmentChange}
      />
    );
  }

  if (scene?.type === "checkpoint") {
    return (
      <CheckpointSceneCanvas
        scene={scene}
        onAssessmentChange={(assessment) =>
          onUpdateSceneAssessment?.(scene.id, assessment)
        }
      />
    );
  }

  const blocks = scene?.blocks ?? [];
  const horizontalLayout = getHorizontalLayout(scene);
  const verticalLayout = getVerticalLayout(scene);

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f4f7fb]">
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            <span className="shrink-0">Topic</span>
            <span className="text-slate-300">/</span>
            <span className="truncate normal-case tracking-normal text-[#1557c0]">
              {topicTitle ?? "No topic selected"}
            </span>
          </div>

          <div className="mt-1 flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-600">
            <span className="truncate text-slate-950">
              {lessonTitle ?? "Untitled lesson"}
            </span>
            <span className="shrink-0 text-slate-300">/</span>
            <span className="truncate text-slate-600">
              {scene?.title ?? "Untitled scene"}
            </span>
          </div>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
              aria-label="Open canvas menu"
              title="Canvas menu"
            >
              <MoreVertical className="h-5 w-5" />
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
                {scene ? (
                  <EditableSceneTitle
                    title={scene.title || "Untitled scene"}
                    onRename={(title) => onRenameScene(scene.id, title)}
                  />
                ) : (
                  "Create your first learning scene"
                )}
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
