import { useEffect, useRef } from "react";
import type { Scene } from "../types";
import { getSceneNarration } from "../utils/getSceneNarration";

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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const script = getSceneNarration({ voiceover: scene.voiceover });
  const audioUrl = scene.voiceover?.audioUrl;
  const sceneId = scene.id;
  const speed = scene.voiceover?.speed ?? 1;

  useEffect(() => {
    if (
      !enabled ||
      audioUrl ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const speech = window.speechSynthesis;

    function cancelCurrent() {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      speech.cancel();
      utteranceRef.current = null;
    }

    cancelCurrent();

    if (!isPlaying || !script) {
      return cancelCurrent;
    }

    function speakWhenReady(voices: SpeechSynthesisVoice[]) {
      timeoutRef.current = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(script);

        utterance.voice =
          voices.find((voice) => voice.default) ??
          voices.find((voice) => voice.lang.startsWith("en-GB")) ??
          voices.find((voice) => voice.lang.startsWith("en")) ??
          null;

        utterance.lang = utterance.voice?.lang ?? "en-US";
        utterance.rate = speed;
        utterance.pitch = 1;
        utterance.volume = volume;

        utterance.onend = () => {
          if (utteranceRef.current === utterance) {
            utteranceRef.current = null;
          }
        };

        utterance.onerror = (event) => {
          if (event.error === "interrupted") {
            return;
          }

          console.warn("[useVoiceover] speech error:", event.error);
          if (utteranceRef.current === utterance) {
            utteranceRef.current = null;
          }
        };

        utteranceRef.current = utterance;
        speech.speak(utterance);
      }, 0);
    }

    const voices = speech.getVoices();
    if (voices.length > 0) {
      speakWhenReady(voices);
      return cancelCurrent;
    }

    const handleVoicesChanged = () => {
      speech.removeEventListener("voiceschanged", handleVoicesChanged);
      speakWhenReady(speech.getVoices());
    };

    speech.addEventListener("voiceschanged", handleVoicesChanged);

    return () => {
      speech.removeEventListener("voiceschanged", handleVoicesChanged);
      cancelCurrent();
    };
  }, [audioUrl, enabled, isPlaying, sceneId, script, speed, volume]);
}
