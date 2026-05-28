import { useEffect, useRef, useState } from "react";
import type { Scene } from "../types";

export function useSceneAudio({
  isPlaying,
  scene,
  volume,
}: {
  isPlaying: boolean;
  scene: Scene;
  volume: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioUrl = scene.voiceover?.audioUrl;
  const sceneId = scene.id;

  useEffect(() => {
    if (!audioUrl || typeof Audio === "undefined") {
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    function updateTime() {
      setCurrentTime(audio.currentTime);
    }

    function updateDuration() {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    }

    function markPlaying() {
      setIsAudioPlaying(true);
    }

    function markPaused() {
      setIsAudioPlaying(false);
    }

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", updateTime);
    audio.addEventListener("play", markPlaying);
    audio.addEventListener("pause", markPaused);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", updateTime);
      audio.removeEventListener("play", markPlaying);
      audio.removeEventListener("pause", markPaused);
      audioRef.current = null;
      setCurrentTime(0);
      setDuration(0);
      setIsAudioPlaying(false);
    };
  }, [audioUrl, sceneId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      void audio.play().catch((error) => {
        setIsAudioPlaying(false);
        console.warn("[useSceneAudio] audio playback failed:", error);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, audioUrl, sceneId]);

  return {
    currentTime,
    duration,
    hasAudio: Boolean(audioUrl),
    isAudioPlaying,
  };
}
