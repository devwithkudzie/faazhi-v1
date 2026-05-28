import type { CaptionSegment, Scene } from "../../types";
import { CaptionsOverlay } from "./CaptionsOverlay";
import { SceneRenderer } from "../scenes/SceneRenderer";

export function SceneCanvas({
  caption,
  captionsEnabled,
  onContinueScene,
  scene,
  sceneTime,
}: {
  caption: CaptionSegment | null;
  captionsEnabled: boolean;
  onContinueScene?: () => void;
  scene: Scene;
  sceneTime: number;
}) {
  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-[#bfdbfe] bg-white">
      <div key={scene.id} className="h-full min-h-0">
        <SceneRenderer
          onContinueScene={onContinueScene}
          scene={scene}
          sceneTime={sceneTime}
        />
      </div>
      <CaptionsOverlay caption={caption} enabled={captionsEnabled} />
    </div>
  );
}
