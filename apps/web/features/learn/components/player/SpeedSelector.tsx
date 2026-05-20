const speeds = [1, 1.25, 1.5, 2];

export function SpeedSelector({
  onChange,
  speed,
}: {
  onChange: (speed: number) => void;
  speed: number;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        const index = speeds.indexOf(speed);
        onChange(speeds[(index + 1) % speeds.length]);
      }}
      className="rounded-lg px-3 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
    >
      {speed}x
    </button>
  );
}
