"use client";

import type { ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Copy,
  Italic,
  List,
  MoveDown,
  MoveUp,
  Sparkles,
  Trash2,
  Underline,
  WandSparkles,
} from "lucide-react";

import type { AdminSceneBlock } from "@/features/admin/papers/types/paper-workspace.types";

type MoveDirection = "up" | "down";

const colors = ["#0f172a", "#1557c0", "#123f81", "#b45309", "#166534"];
const fontFamilies = [
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Trebuchet", value: "'Trebuchet MS', sans-serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
];

export function FloatingTextToolbar({
  block,
  onDelete,
  onDuplicate,
  onMove,
  onUpdate,
}: {
  block: AdminSceneBlock;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (direction: MoveDirection) => void;
  onUpdate: (updates: Partial<AdminSceneBlock>) => void;
}) {
  const style = block.style ?? {};

  function updateStyle(updates: NonNullable<AdminSceneBlock["style"]>) {
    onUpdate({
      style: {
        ...style,
        ...updates,
      },
    });
  }

  function toggleList() {
    if (block.type === "list") {
      onUpdate({
        type: "paragraph",
        content: Array.isArray(block.content)
          ? block.content.join("\n")
          : block.content,
      });
      return;
    }

    onUpdate({
      type: "list",
      content: Array.isArray(block.content)
        ? block.content
        : block.content.split("\n").filter(Boolean),
    });
  }

  return (
    <div className="mx-auto flex min-h-12 w-full max-w-5xl items-center gap-1 overflow-x-auto rounded-2xl border border-[#1557c0]/25 bg-white px-3 py-2 shadow-[0_16px_44px_rgba(15,23,42,0.16)] ring-2 ring-[#eaf2ff]">
      <select
        aria-label="Font family"
        value={style.fontFamily ?? "Inter, system-ui, sans-serif"}
        onChange={(event) => updateStyle({ fontFamily: event.target.value })}
        className="h-8 min-w-32 rounded-lg border border-slate-200 px-2 text-xs font-semibold outline-none focus:border-[#1557c0]"
      >
        {fontFamilies.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>

      <input
        aria-label="Font size"
        type="number"
        min={12}
        max={72}
        value={style.fontSize ?? 18}
        onChange={(event) =>
          updateStyle({ fontSize: Number(event.target.value) })
        }
        className="h-8 w-14 rounded-lg border border-slate-200 px-2 text-xs font-semibold outline-none focus:border-[#1557c0]"
      />

      <ToolbarButton
        active={(style.fontWeight ?? 400) >= 700}
        label="Bold"
        onClick={() =>
          updateStyle({ fontWeight: (style.fontWeight ?? 400) >= 700 ? 400 : 700 })
        }
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={Boolean(style.italic)}
        label="Italic"
        onClick={() => updateStyle({ italic: !style.italic })}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={Boolean(style.underline)}
        label="Underline"
        onClick={() => updateStyle({ underline: !style.underline })}
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={block.type === "list"}
        label="Bulleted list"
        onClick={toggleList}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        active={(style.align ?? "left") === "left"}
        label="Align left"
        onClick={() => updateStyle({ align: "left" })}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={style.align === "center"}
        label="Align center"
        onClick={() => updateStyle({ align: "center" })}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={style.align === "right"}
        label="Align right"
        onClick={() => updateStyle({ align: "right" })}
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
            onClick={() => updateStyle({ color })}
            className={[
              "h-5 w-5 rounded-full ring-offset-2",
              (style.color ?? "#0f172a") === color
                ? "ring-2 ring-[#1557c0]"
                : "ring-1 ring-slate-200",
            ].join(" ")}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <Divider />

      <ToolbarButton
        active={Boolean(style.effect && style.effect !== "none")}
        label="Effects"
        onClick={() =>
          updateStyle({
            effect:
              style.effect === "shadow"
                ? "lift"
                : style.effect === "lift"
                  ? "outline"
                  : style.effect === "outline"
                    ? "none"
                    : "shadow",
          })
        }
      >
        <WandSparkles className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        active={Boolean(block.animation && block.animation !== "none")}
        label="Animate"
        onClick={() =>
          onUpdate({
            animation:
              block.animation === "fade"
                ? "slide-up"
                : block.animation === "slide-up"
                  ? "zoom"
                  : block.animation === "zoom"
                    ? "draw"
                    : "fade",
          })
        }
      >
        <Sparkles className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton label="Move up" onClick={() => onMove("up")}>
        <MoveUp className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Move down" onClick={() => onMove("down")}>
        <MoveDown className="h-4 w-4" />
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
        "grid h-8 w-8 place-items-center rounded-lg transition",
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
