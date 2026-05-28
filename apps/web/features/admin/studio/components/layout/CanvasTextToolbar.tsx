"use client";

import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Copy,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Minus,
  Plus,
  Trash2,
  Underline,
} from "lucide-react";

import type { AdminSceneBlock } from "@/features/admin/papers/types/paper-workspace.types";

type MoveDirection = "up" | "down";

const colors = ["#0f172a", "#1557c0", "#123f81", "#b45309", "#166534"];
const highlights = ["#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3"];
const fontFamilies = [
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Poppins", value: "Poppins, Inter, system-ui, sans-serif" },
  { label: "Merriweather", value: "Merriweather, Georgia, serif" },
  { label: "Playfair", value: "'Playfair Display', Georgia, serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier", value: "'Courier New', monospace" },
];

export function CanvasTextToolbar({
  block,
  editor,
  onDelete,
  onDuplicate,
  onMove,
  onUpdate,
}: {
  block: AdminSceneBlock;
  editor: Editor | null;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (direction: MoveDirection) => void;
  onUpdate: (updates: Partial<AdminSceneBlock>) => void;
}) {
  const style = block.style ?? {};
  const fontSize = style.fontSize ?? 18;

  function updateStyle(updates: NonNullable<AdminSceneBlock["style"]>) {
    onUpdate({
      style: {
        ...style,
        ...updates,
      },
    });
  }

  function run(command: () => void) {
    if (!editor) return;
    command();
  }

  return (
    <div className="mx-auto flex min-h-12 w-full max-w-5xl items-center gap-1 overflow-x-auto rounded-2xl border border-[#1557c0]/25 bg-white px-3 py-2 shadow-[0_16px_44px_rgba(15,23,42,0.16)] ring-2 ring-[#eaf2ff]">
      <select
        aria-label="Font family"
        value={style.fontFamily ?? fontFamilies[0].value}
        onChange={(event) => {
          const fontFamily = event.target.value;
          updateStyle({ fontFamily });
          run(() => editor?.chain().focus().setFontFamily(fontFamily).run());
        }}
        className="h-8 min-w-36 rounded-lg border border-slate-200 px-2 text-xs font-semibold outline-none focus:border-[#1557c0]"
      >
        {fontFamilies.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>

      <ToolbarButton
        label="Decrease font size"
        onClick={() => updateStyle({ fontSize: Math.max(12, fontSize - 2) })}
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <input
        aria-label="Font size"
        type="number"
        min={12}
        max={96}
        value={fontSize}
        onChange={(event) =>
          updateStyle({ fontSize: Number(event.target.value) })
        }
        className="h-8 w-14 rounded-lg border border-slate-200 px-2 text-xs font-semibold outline-none focus:border-[#1557c0]"
      />
      <ToolbarButton
        label="Increase font size"
        onClick={() => updateStyle({ fontSize: Math.min(96, fontSize + 2) })}
      >
        <Plus className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={Boolean(editor?.isActive("bold"))}
        label="Bold"
        onClick={() => run(() => editor?.chain().focus().toggleBold().run())}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={Boolean(editor?.isActive("italic"))}
        label="Italic"
        onClick={() => run(() => editor?.chain().focus().toggleItalic().run())}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={Boolean(editor?.isActive("underline"))}
        label="Underline"
        onClick={() =>
          run(() => editor?.chain().focus().toggleUnderline().run())
        }
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={Boolean(editor?.isActive("bulletList"))}
        label="Bulleted list"
        onClick={() =>
          run(() => editor?.chain().focus().toggleBulletList().run())
        }
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={Boolean(editor?.isActive("orderedList"))}
        label="Numbered list"
        onClick={() =>
          run(() => editor?.chain().focus().toggleOrderedList().run())
        }
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={Boolean(editor?.isActive({ textAlign: "left" }))}
        label="Align left"
        onClick={() => {
          updateStyle({ align: "left" });
          run(() => editor?.chain().focus().setTextAlign("left").run());
        }}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={Boolean(editor?.isActive({ textAlign: "center" }))}
        label="Align center"
        onClick={() => {
          updateStyle({ align: "center" });
          run(() => editor?.chain().focus().setTextAlign("center").run());
        }}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={Boolean(editor?.isActive({ textAlign: "right" }))}
        label="Align right"
        onClick={() => {
          updateStyle({ align: "right" });
          run(() => editor?.chain().focus().setTextAlign("right").run());
        }}
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <div className="flex items-center gap-1 px-1">
        {colors.map((color) => (
          <button
            key={color}
            aria-label={`Set text color ${color}`}
            type="button"
            onClick={() => {
              updateStyle({ color });
              run(() => editor?.chain().focus().setColor(color).run());
            }}
            className={[
              "h-5 w-5 rounded-full ring-offset-2",
              (style.color ?? "#0f172a") === color
                ? "ring-2 ring-[#1557c0]"
                : "ring-1 ring-slate-200",
            ].join(" ")}
            style={{ backgroundColor: color }}
          />
        ))}
        <input
          aria-label="Custom text color"
          type="color"
          value={style.color ?? "#0f172a"}
          onChange={(event) => {
            const color = event.target.value;
            updateStyle({ color });
            run(() => editor?.chain().focus().setColor(color).run());
          }}
          className="h-6 w-7 cursor-pointer rounded-md border border-slate-200 bg-white p-0.5"
          title="Custom text color"
        />
      </div>

      <div className="flex items-center gap-1 px-1">
        <Highlighter className="h-4 w-4 text-slate-500" />
        {highlights.map((color) => (
          <button
            key={color}
            aria-label={`Highlight ${color}`}
            type="button"
            onClick={() =>
              run(() =>
                editor?.chain().focus().toggleHighlight({ color }).run(),
              )
            }
            className="h-5 w-5 rounded-full ring-1 ring-slate-200 ring-offset-2 hover:ring-2 hover:ring-[#1557c0]"
            style={{ backgroundColor: color }}
          />
        ))}
        <input
          aria-label="Custom highlight color"
          type="color"
          defaultValue="#dbeafe"
          onChange={(event) => {
            const color = event.target.value;
            run(() =>
              editor?.chain().focus().toggleHighlight({ color }).run(),
            );
          }}
          className="h-6 w-7 cursor-pointer rounded-md border border-slate-200 bg-white p-0.5"
          title="Custom highlight color"
        />
      </div>

      <Divider />

      <ToolbarButton label="Move up" onClick={() => onMove("up")}>
        <span className="text-sm font-bold">↑</span>
      </ToolbarButton>
      <ToolbarButton label="Move down" onClick={() => onMove("down")}>
        <span className="text-sm font-bold">↓</span>
      </ToolbarButton>
      <ToolbarButton label="Duplicate" onClick={onDuplicate}>
        <Copy className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton destructive label="Delete" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-slate-200" />;
}

function ToolbarButton({
  active,
  children,
  destructive,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  destructive?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      type="button"
      onClick={onClick}
      className={[
        "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition",
        active
          ? "bg-[#eaf2ff] text-[#1557c0]"
          : destructive
            ? "text-red-500 hover:bg-red-50"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
