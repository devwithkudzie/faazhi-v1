export function Timeline({
  currentTime,
  duration,
  markers = [],
  onSeek,
}: {
  currentTime: number;
  duration: number;
  markers?: Array<{
    label: string;
    time: number;
    type?: "checkpoint";
  }>;
  onSeek: (time: number) => void;
}) {
  const safeDuration = Math.max(duration, 1);

  return (
    <div className="relative py-2">
      <input
        aria-label="Lesson timeline"
        type="range"
        min={0}
        max={safeDuration}
        step={1}
        value={currentTime}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="relative z-10 h-1 w-full accent-[#1557c0]"
      />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-1 -translate-y-1/2">
        {markers.map((marker) => {
          const position = Math.min(
            100,
            Math.max(0, (marker.time / safeDuration) * 100),
          );

          return (
            <span
              key={`${marker.type ?? "marker"}-${marker.time}-${marker.label}`}
              className="absolute top-1/2 grid h-4 w-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.85)]"
              style={{ left: `${position}%` }}
              title={marker.label}
              aria-hidden="true"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
            </span>
          );
        })}
      </div>
    </div>
  );
}
