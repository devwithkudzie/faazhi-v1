import { useEffect, useMemo, useState } from "react";
import type { Scene } from "../types";
import { getLessonDuration, getSceneAtTime } from "../utils/timeline";

export function useScenePlayer(scenes: Scene[]) {
  const sceneKey = useMemo(
    () => scenes.map((scene) => scene.id).join("|"),
    [scenes],
  );
  const duration = useMemo(() => getLessonDuration(scenes), [scenes]);
  const [playerState, setPlayerState] = useState({
    sceneKey,
    currentTime: 0,
    isPlaying: false,
    speed: 1,
  });
  const currentTime =
    playerState.sceneKey === sceneKey ? playerState.currentTime : 0;
  const isPlaying =
    playerState.sceneKey === sceneKey ? playerState.isPlaying : false;
  const speed = playerState.sceneKey === sceneKey ? playerState.speed : 1;
  const sceneState = useMemo(
    () => getSceneAtTime(scenes, currentTime),
    [currentTime, scenes],
  );

  useEffect(() => {
    if (!isPlaying || duration <= 0) return;

    const timer = window.setInterval(() => {
      setPlayerState((state) => {
        const safeState =
          state.sceneKey === sceneKey
            ? state
            : {
                sceneKey,
                currentTime: 0,
                isPlaying: false,
                speed: 1,
              };
        const nextTime = Math.min(duration, safeState.currentTime + 0.5 * speed);

        return {
          ...safeState,
          currentTime: nextTime,
          isPlaying: nextTime >= duration ? false : safeState.isPlaying,
        };
      });
    }, 500);

    return () => window.clearInterval(timer);
  }, [duration, isPlaying, sceneKey, speed]);

  const updatePlayerState = (
    update: Partial<{
      currentTime: number;
      isPlaying: boolean;
      speed: number;
    }>,
  ) => {
    setPlayerState((state) => ({
      sceneKey,
      currentTime: state.sceneKey === sceneKey ? state.currentTime : 0,
      isPlaying: state.sceneKey === sceneKey ? state.isPlaying : false,
      speed: state.sceneKey === sceneKey ? state.speed : 1,
      ...update,
    }));
  };

  return {
    currentTime,
    duration,
    isPlaying,
    scene: sceneState.scene,
    sceneIndex: sceneState.sceneIndex,
    sceneTime: sceneState.sceneTime,
    speed,
    pause: () => updatePlayerState({ isPlaying: false }),
    play: () => updatePlayerState({ isPlaying: true }),
    seek: (time: number) =>
      updatePlayerState({ currentTime: Math.min(duration, Math.max(0, time)) }),
    setSpeed: (nextSpeed: number) => updatePlayerState({ speed: nextSpeed }),
    toggle: () => updatePlayerState({ isPlaying: !isPlaying }),
  };
}
