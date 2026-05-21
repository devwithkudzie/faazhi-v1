"use client";

import {
  AudioLines,
  Blocks,
  Braces,
  ClipboardCheck,
  Film,
  Images,
  MousePointerClick,
  Play,
  Sparkles,
} from "lucide-react";

export type StudioTool =
  | "lesson-tree"
  | "scenes"
  | "blocks"
  | "interactions"
  | "assessments"
  | "voiceover"
  | "media"
  | "templates"
  | "json"
  | "preview";

const tools = [
  { id: "lesson-tree", label: "Tree", icon: Film },
  { id: "scenes", label: "Scenes", icon: Film },
  { id: "blocks", label: "Blocks", icon: Blocks },
  { id: "interactions", label: "Interact", icon: MousePointerClick },
  { id: "assessments", label: "Assess", icon: ClipboardCheck },
  { id: "voiceover", label: "Voice", icon: AudioLines },
  { id: "media", label: "Media", icon: Images },
  { id: "templates", label: "Templates", icon: Sparkles },
  { id: "json", label: "JSON", icon: Braces },
  { id: "preview", label: "Preview", icon: Play },
] satisfies Array<{ id: StudioTool; label: string; icon: React.ComponentType<{ className?: string }> }>;

export function StudioToolRail({
  activeTool,
  onSelectTool,
}: {
  activeTool: StudioTool;
  onSelectTool: (tool: StudioTool) => void;
}) {
  return (
    <aside className="flex w-[82px] shrink-0 flex-col items-center gap-1 border-r border-slate-200 bg-white px-2 py-3">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const active = activeTool === tool.id;

        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => onSelectTool(tool.id)}
            className={[
              "flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition",
              active
                ? "bg-[#eaf2ff] text-[#1557c0]"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
            <span>{tool.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
