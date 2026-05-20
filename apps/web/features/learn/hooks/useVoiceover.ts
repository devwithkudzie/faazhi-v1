import { useEffect } from "react";
import type { Scene } from "../types";

export function useVoiceover({
  enabled = true,
  isPlaying,
  scene,
  volume,
}: {
  enabled?: boolean;
  isPlaying: boolean;
  scene: Scene;
  volume: number;
}) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    if (!isPlaying) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(scene.narration);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = volume;

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [enabled, isPlaying, scene.id, scene.narration, volume]);
}
