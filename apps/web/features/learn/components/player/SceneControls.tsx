import {
  Captions,
  FastForward,
  Maximize,
  Pause,
  Play,
  Rewind,
  Settings,
  Volume2,
} from "lucide-react";
import { formatTime } from "../../utils/timeline";
import { SpeedSelector } from "./SpeedSelector";
import { Timeline } from "./Timeline";

export function SceneControls({
  captionsEnabled,
  currentTime,
  duration,
  isPlaying,
  markers,
  onSeek,
  onToggleCaptions,
  onTogglePlay,
  onVoiceVolumeChange,
  setSpeed,
  speed,
  voiceVolume,
}: {
  captionsEnabled: boolean;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  markers?: Array<{
    label: string;
    time: number;
    type?: "checkpoint";
  }>;
  onSeek: (time: number) => void;
  onToggleCaptions: () => void;
  onTogglePlay: () => void;
  onVoiceVolumeChange: (volume: number) => void;
  setSpeed: (speed: number) => void;
  speed: number;
  voiceVolume: number;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-5 pb-5 pt-12 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
      <Timeline
        currentTime={currentTime}
        duration={duration}
        markers={markers}
        onSeek={onSeek}
      />

      <div className="mt-3 flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg px-2 py-2 text-white/90 transition hover:bg-white/10 xl:flex">
            <Volume2 className="h-5 w-5" />
            <input
              aria-label="Voiceover volume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={voiceVolume}
              onChange={(event) => onVoiceVolumeChange(Number(event.target.value))}
              className="h-1 w-20 accent-white"
            />
          </div>
          <button
            type="button"
            onClick={onTogglePlay}
            className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 transition hover:bg-white/20"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => onSeek(currentTime - 10)}
            className="grid h-10 w-10 place-items-center rounded-lg transition hover:bg-white/10"
            aria-label="Rewind 10 seconds"
          >
            <Rewind className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onSeek(currentTime + 10)}
            className="grid h-10 w-10 place-items-center rounded-lg transition hover:bg-white/10"
            aria-label="Forward 10 seconds"
          >
            <FastForward className="h-5 w-5" />
          </button>
          <span className="ml-2 text-sm font-semibold">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCaptions}
            className={[
              "grid h-10 w-10 place-items-center rounded-lg transition",
              captionsEnabled
                ? "bg-[#1557c0] text-white"
                : "hover:bg-white/10",
            ].join(" ")}
            aria-label="Toggle captions"
          >
            <Captions className="h-5 w-5" />
          </button>
          <SpeedSelector speed={speed} onChange={setSpeed} />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg transition hover:bg-white/10"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg transition hover:bg-white/10"
            aria-label="Fullscreen"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
