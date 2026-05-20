import { BookText, Captions, NotebookText, Sparkles } from "lucide-react";

export type DrawerTab = "transcript" | "notes" | "takeaways";

export function CanvasFooter({
  captionsEnabled,
  onToggleCaptions,
  onOpenDrawer,
}: {
  captionsEnabled: boolean;
  onToggleCaptions: () => void;
  onOpenDrawer: (tab: DrawerTab) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-b-2xl border-x border-b border-border bg-white p-4">
      <button
        type="button"
        onClick={() => onOpenDrawer("transcript")}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
      >
        <BookText className="h-4 w-4" />
        Transcript
      </button>
      <button
        type="button"
        onClick={() => onOpenDrawer("notes")}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
      >
        <NotebookText className="h-4 w-4" />
        Notes
      </button>
      <button
        type="button"
        onClick={() => onOpenDrawer("takeaways")}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
      >
        <Sparkles className="h-4 w-4" />
        Key takeaways
      </button>
      <button
        type="button"
        onClick={onToggleCaptions}
        className={[
          "ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
          captionsEnabled
            ? "bg-[#1557c0] text-white"
            : "hover:bg-[#eaf2ff] hover:text-[#1557c0]",
        ].join(" ")}
      >
        <Captions className="h-4 w-4" />
        CC
      </button>
    </div>
  );
}
