import type { CaptionSegment } from "../types";

export function getActiveCaption(
  captions: CaptionSegment[],
  sceneTime: number,
) {
  return (
    captions.find(
      (caption) => sceneTime >= caption.start && sceneTime <= caption.end,
    ) ?? null
  );
}
