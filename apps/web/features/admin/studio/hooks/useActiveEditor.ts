"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";

export function useActiveEditor() {
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  function selectBlock(blockId: string, editor?: Editor | null) {
    setSelectedBlockId(blockId);
    if (editor !== undefined) {
      setActiveEditor(editor);
    }
  }

  function clearSelection() {
    setSelectedBlockId(null);
    setActiveEditor(null);
  }

  return {
    activeEditor,
    clearSelection,
    selectedBlockId,
    selectBlock,
    setActiveEditor,
    setSelectedBlockId,
  };
}
