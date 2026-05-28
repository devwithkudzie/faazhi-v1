import type { Scene } from "../types";

export function getSceneNarration(
  scene: Pick<Scene, "voiceover">,
) {
  return scene.voiceover?.script?.trim() ?? "";
}
