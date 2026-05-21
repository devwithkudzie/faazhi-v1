"use client";

import {
  AudioLines,
  Images,
  LayoutPanelLeft,
  MousePointerClick,
  Palette,
  Play,
  Sparkles,
  Type,
} from "lucide-react";

export type StudioTool =
  | "structure"
  | "content"
  | "design"
  | "interaction"
  | "narration"
  | "media"
  | "animation"
  | "preview";

const tools = [
  { id: "structure", label: "Structure", icon: LayoutPanelLeft },
  { id: "content", label: "Content", icon: Type },
  { id: "design", label: "Design", icon: Palette },
  { id: "interaction", label: "Interact", icon: MousePointerClick },
  { id: "narration", label: "Narrate", icon: AudioLines },
  { id: "media", label: "Media", icon: Images },
  { id: "animation", label: "Animate", icon: Sparkles },
  { id: "preview", label: "Preview", icon: Play },
] satisfies Array<{
  id: StudioTool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}>;

export function StudioToolRail({
  activeTool,
  onSelectTool,
}: {
  activeTool: StudioTool;
  onSelectTool: (tool: StudioTool) => void;
}) {
  return (
    <aside className="flex w-[86px] shrink-0 flex-col items-center gap-1 border-r border-slate-200 bg-white px-2 py-3">
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