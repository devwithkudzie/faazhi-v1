import type { CaptionSegment, Scene } from "../../types";
import { SceneRenderer } from "../scenes/SceneRenderer";
import { SceneCanvas } from "./SceneCanvas";
import { SceneControls } from "./SceneControls";
import { Timeline } from "./Timeline";

export function ScenePlayer({
  caption,
  captionsEnabled,
  currentTime,
  duration,
  isPlaying,
  markers,
  onContinueScene,
  onSeek,
  onToggleCaptions,
  onTogglePlay,
  onVoiceVolumeChange,
  scene,
  sceneTime,
  setSpeed,
  speed,
  voiceVolume,
}: {
  caption: CaptionSegment | null;
  captionsEnabled: boolean;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  markers?: Array<{
    label: string;
    time: number;
    type?: "checkpoint";
  }>;
  onContinueScene?: () => void;
  onSeek: (time: number) => void;
  onToggleCaptions: () => void;
  onTogglePlay: () => void;
  onVoiceVolumeChange: (volume: number) => void;
  scene: Scene;
  sceneTime: number;
  setSpeed: (speed: number) => void;
  speed: number;
  voiceVolume: number;
}) {
  const isCheckpointScene =
    scene.type === "checkpoint" ||
    scene.type === "interactive" ||
    scene.type === "quiz";

  return (
    <div className="group relative h-full overflow-hidden rounded-2xl bg-white shadow-[0_20px_80px_rgba(21,87,192,0.12)]">
      {isCheckpointScene ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fbff_42%,#eef4ff_100%)]">
            <div className="flex h-full items-center justify-center p-10 text-center">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1557c0]">
                  Player paused
                </p>
                <p className="mt-4 text-lg font-semibold text-slate-700">
                  Complete the checkpoint to continue the lesson.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 z-20">
            <SceneRenderer
              onContinueScene={onContinueScene}
              scene={scene}
              sceneTime={sceneTime}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pb-5 pt-12">
            <Timeline
              currentTime={currentTime}
              duration={duration}
              markers={markers}
              onSeek={onSeek}
            />
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-white/90">
              <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626] shadow-[0_0_0_2px_rgba(255,255,255,0.85)]" />
              Checkpoint
            </div>
          </div>
        </>
      ) : (
        <>
          <SceneCanvas
            caption={caption}
            captionsEnabled={captionsEnabled}
            onContinueScene={onContinueScene}
            scene={scene}
            sceneTime={sceneTime}
          />
          <SceneControls
            captionsEnabled={captionsEnabled}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            markers={markers}
            onSeek={onSeek}
            onToggleCaptions={onToggleCaptions}
            onTogglePlay={onTogglePlay}
            onVoiceVolumeChange={onVoiceVolumeChange}
            setSpeed={setSpeed}
            speed={speed}
            voiceVolume={voiceVolume}
          />
        </>
      )}
    </div>
  );
}
