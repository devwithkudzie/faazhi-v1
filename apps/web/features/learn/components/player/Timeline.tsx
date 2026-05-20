export function Timeline({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}) {
  return (
    <input
      aria-label="Lesson timeline"
      type="range"
      min={0}
      max={Math.max(duration, 1)}
      step={1}
      value={currentTime}
      onChange={(event) => onSeek(Number(event.target.value))}
      className="h-1 w-full accent-[#1557c0]"
    />
  );
}
