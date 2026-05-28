import type { CaptionSegment, Scene } from "../../types";
import { SceneRenderer } from "../scenes/SceneRenderer";
import { SceneCanvas } from "./SceneCanvas";
import { SceneControls } from "./SceneControls";

export function ScenePlayer({
  caption,
  captionsEnabled,
  currentTime,
  duration,
  isPlaying,
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
