"use client";

import {
  AudioLines,
  FileText,
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
  | "text"
  | "design"
  | "interaction"
  | "narration"
  | "media"
  | "animation"
  | "preview";

const tools = [
  { id: "structure", label: "Structure", icon: LayoutPanelLeft },
  { id: "content", label: "Scene flow", icon: FileText },
  { id: "text", label: "Text", icon: Type },
  { id: "design", label: "Design", icon: Palette },
  { id: "interaction", label: "Interact", icon: MousePointerClick },
  { id: "animation", label: "Animate", icon: Sparkles },
  { id: "narration", label: "Narrate", icon: AudioLines },
  { id: "media", label: "Media", icon: Images },
  { id: "preview", label: "Preview", icon: Play },
] satisfies Array<{
  id: StudioTool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}>;

const launchTools = new Set<StudioTool>([
  "structure",
  "content",
  "text",
  "narration",
  "preview",
]);

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
        const disabled = !launchTools.has(tool.id);

        return (
          <div key={tool.id} className="group relative w-full">
            <button
              type="button"
              aria-disabled={disabled}
              title={disabled ? `${tool.label} coming soon` : undefined}
              onClick={() => {
                if (disabled) return;
                onSelectTool(tool.id);
              }}
              className={[
                "flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition",
                disabled
                  ? "cursor-not-allowed text-slate-300 grayscale"
                  : active
                    ? "bg-[#eaf2ff] text-[#1557c0]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              <Icon className="h-5 w-5" />
              <span>{tool.label}</span>
            </button>

            {disabled ? (
              <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
                Coming soon
              </span>
            ) : null}
          </div>
        );
      })}
    </aside>
  );
}
