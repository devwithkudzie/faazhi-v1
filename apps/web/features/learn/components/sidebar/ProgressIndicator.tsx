import { Check, Circle, Lock } from "lucide-react";
import type { LessonState } from "../../types";

export function ProgressIndicator({ state }: { state: LessonState }) {
  if (state === "completed") {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1557c0] text-white">
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }

  if (state === "current") {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-[#1557c0] bg-white">
        <span className="h-2.5 w-2.5 rounded-full bg-[#1557c0]" />
      </span>
    );
  }

  if (state === "locked") {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground">
      <Circle className="h-3.5 w-3.5" />
    </span>
  );
}
