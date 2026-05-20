import { useMemo } from "react";
import type { Scene } from "../types";
import { getActiveCaption } from "../utils/captions";

export function useCaptions(scene: Scene, sceneTime: number) {
  return useMemo(
    () => getActiveCaption(scene.captions, sceneTime),
    [scene, sceneTime],
  );
}
