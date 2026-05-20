import { X } from "lucide-react";
import type { LessonNode } from "../../types";
import type { DrawerTab } from "../shell/LessonWorkspaceFooter";

const tabLabels: Record<DrawerTab, string> = {
  transcript: "Transcript",
  notes: "Notes",
  takeaways: "Key Takeaways",
};

export function ContextDrawer({
  activeTab,
  lesson,
  onClose,
  onTabChange,
}: {
  activeTab: DrawerTab;
  lesson: LessonNode;
  onClose: () => void;
  onTabChange: (tab: DrawerTab) => void;
}) {
  const transcript = lesson.scenes.flatMap((scene) =>
    scene.captions.map((caption) => ({
      ...caption,
      sceneTitle: scene.title,
    })),
  );

  return (
    <aside className="h-full w-full max-w-md shrink-0 bg-white shadow-[-10px_0_28px_rgba(15,23,42,0.10)]">
      <div className="flex items-center justify-between px-5 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Learning drawer
          </p>
          <h2 className="mt-1 text-lg font-semibold">{tabLabels[activeTab]}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted"
          aria-label="Close drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2 px-5 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        {(["transcript", "notes", "takeaways"] as DrawerTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={[
              "rounded-lg px-3 py-2 text-xs font-semibold transition",
              activeTab === tab
                ? "bg-[#1557c0] text-white"
                : "hover:bg-[#eaf2ff] hover:text-[#1557c0]",
            ].join(" ")}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="h-[calc(100%-132px)] overflow-y-auto p-5">
        {activeTab === "transcript" ? (
          <div className="space-y-4">
            {transcript.map((item) => (
              <div key={item.id} className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs font-semibold text-[#1557c0]">
                  {item.sceneTitle} · {item.start}s
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "notes" ? (
          <div className="space-y-4">
            {lesson.scenes.map((scene) => (
              <div key={scene.id} className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">{scene.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {scene.examinerInsight ?? scene.narration}
                </p>
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-[#1557c0]"
                >
                  Save note
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "takeaways" ? (
          <div className="space-y-3">
            {lesson.scenes.flatMap((scene) => scene.blocks ?? []).map((block) => (
              <p
                key={block}
                className="rounded-xl bg-[#eaf2ff] p-4 text-sm font-medium leading-6 text-[#163b73]"
              >
                {block}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
