import type { Scene } from "../types";

export function getLessonDuration(scenes: Scene[]) {
  return scenes.reduce((total, scene) => total + scene.duration, 0);
}

export function getSceneStart(scenes: Scene[], sceneIndex: number) {
  return scenes
    .slice(0, sceneIndex)
    .reduce((total, scene) => total + scene.duration, 0);
}

export function getSceneAtTime(scenes: Scene[], currentTime: number) {
  let elapsed = 0;

  for (let index = 0; index < scenes.length; index += 1) {
    const scene = scenes[index];
    const nextElapsed = elapsed + scene.duration;

    if (currentTime < nextElapsed || index === scenes.length - 1) {
      return {
        scene,
        sceneIndex: index,
        sceneTime: Math.max(0, currentTime - elapsed),
        sceneStart: elapsed,
      };
    }

    elapsed = nextElapsed;
  }

  return {
    scene: scenes[0],
    sceneIndex: 0,
    sceneTime: 0,
    sceneStart: 0,
  };
}

export function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;

  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}
