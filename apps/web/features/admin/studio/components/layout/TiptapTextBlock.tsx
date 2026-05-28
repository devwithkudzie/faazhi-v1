"use client";

import { useEffect, useRef, useState } from "react";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, type Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import type { AdminSceneBlock } from "@/features/admin/papers/types/paper-workspace.types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function blockContentToHtml(block: AdminSceneBlock) {
  if (Array.isArray(block.content)) {
    const tagName = block.type === "numbered-list" ? "ol" : "ul";

    return `<${tagName}>${block.content
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("")}</${tagName}>`;
  }

  const content = block.content.trim();
  if (content.startsWith("<")) return content;

  if (block.type === "heading") {
    return `<h2>${escapeHtml(content || "New heading")}</h2>`;
  }

  if (block.type === "quote") {
    return `<blockquote>${escapeHtml(content || "Quote text")}</blockquote>`;
  }

  return `<p>${escapeHtml(content || "Write your text here...")}</p>`;
}

function getEditorClass(block: AdminSceneBlock, previewPlain = false) {
  const effect = block.style?.effect ?? "none";

  return [
    "faazhi-tiptap-block min-w-[10ch] max-w-full rounded-md px-1 py-0.5 outline-none",
    "[&_.ProseMirror]:min-w-[10ch] [&_.ProseMirror]:max-w-full [&_.ProseMirror]:outline-none",
    "[&_.ProseMirror_p]:m-0 [&_.ProseMirror_h1]:m-0 [&_.ProseMirror_h2]:m-0 [&_.ProseMirror_h3]:m-0",
    "[&_.ProseMirror_ul]:m-0 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5",
    "[&_.ProseMirror_ol]:m-0 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5",
    "[&_.ProseMirror_blockquote]:m-0 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-[#1557c0] [&_.ProseMirror_blockquote]:pl-4",
    previewPlain
      ? "[&_.ProseMirror_*]:!text-[inherit] [&_.ProseMirror_*]:!font-[inherit] [&_.ProseMirror_*]:!leading-[inherit]"
      : "",
    !previewPlain && effect === "highlight" ? "bg-yellow-100/70" : "",
    !previewPlain && effect === "soft-card"
      ? "bg-[#eef6ff] px-4 py-3 ring-1 ring-blue-100"
      : "",
    !previewPlain && effect === "accent-bar"
      ? "border-l-4 border-[#1557c0] pl-4"
      : "",
  ].join(" ");
}

function getTextStyle(block: AdminSceneBlock) {
  const style = block.style ?? {};

  return {
    color: style.color,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontStyle: style.italic ? "italic" : undefined,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight,
    textAlign: style.align,
    textDecoration: style.underline ? "underline" : undefined,
    textShadow:
      style.effect === "shadow"
        ? "0 10px 24px rgba(15, 23, 42, 0.22)"
        : style.effect === "lift"
          ? "0 3px 0 rgba(21, 87, 192, 0.14)"
          : undefined,
    WebkitTextStroke:
      style.effect === "outline" ? "1px currentColor" : undefined,
  };
}

export function TiptapTextBlock({
  block,
  className,
  onActiveEditorChange,
  onSelect,
  onUpdate,
  previewPlain = false,
}: {
  block: AdminSceneBlock;
  className?: string;
  onActiveEditorChange: (editor: Editor | null) => void;
  onSelect: () => void;
  onUpdate: (updates: Partial<AdminSceneBlock>) => void;
  previewPlain?: boolean;
}) {
  const [initialContent] = useState(() => blockContentToHtml(block));
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedHtmlRef = useRef(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: initialContent,
    autofocus: "end",
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    immediatelyRender: false,
    onFocus: ({ editor }) => {
      onSelect();
      onActiveEditorChange(editor);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        lastSavedHtmlRef.current = html;
        onUpdate({ content: html });
      }, 220);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!editor || editor.isFocused) return;

    const nextHtml = blockContentToHtml(block);
    if (nextHtml !== lastSavedHtmlRef.current) {
      lastSavedHtmlRef.current = nextHtml;
      editor.commands.setContent(nextHtml, { emitUpdate: false });
    }
  }, [block, editor]);

  return (
    <div
      className={[getEditorClass(block, previewPlain), className]
        .filter(Boolean)
        .join(" ")}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
        if (editor) {
          onActiveEditorChange(editor);
        }
      }}
      style={previewPlain ? undefined : getTextStyle(block)}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
