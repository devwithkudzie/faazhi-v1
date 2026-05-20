import type { CaptionSegment } from "../../types";

export function CaptionsOverlay({
  caption,
  enabled,
}: {
  caption: CaptionSegment | null;
  enabled: boolean;
}) {
  if (!enabled || !caption) return null;

  return (
    <div className="pointer-events-none absolute inset-x-6 bottom-24 flex justify-center">
      <p className="max-w-3xl rounded-xl bg-black/70 px-5 py-3 text-center text-lg font-semibold leading-7 text-white shadow-lg transition-opacity">
        {caption.text}
      </p>
    </div>
  );
}
