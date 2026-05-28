"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AudioLines,
  Mic,
  Play,
  Save,
  Square,
  Upload,
  X,
} from "lucide-react";
import type {
  AdminSceneDraft,
  AdminVoiceoverDraft,
} from "@/features/admin/papers/types/paper-workspace.types";

type VoiceoverTab = "script" | "record" | "upload";
type RecordingState = "idle" | "recording" | "processing" | "saved";

const tabs: Array<{ id: VoiceoverTab; label: string }> = [
  { id: "script", label: "Script" },
  { id: "record", label: "Record" },
  { id: "upload", label: "Upload" },
];

function createDefaultVoiceover(): AdminVoiceoverDraft {
  return {
    mode: "generated",
    script: "",
    speed: 1,
    provider: "browser",
    voiceId: "browser-default",
    captionsEnabled: true,
    processingStatus: "idle",
  };
}

function formatSeconds(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;

  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function VoiceoverTool({
  scene,
  scenes,
  onSelectScene,
  onUpdateScene,
}: {
  scene?: AdminSceneDraft;
  scenes: AdminSceneDraft[];
  onSelectScene: (sceneId: string) => void;
  onUpdateScene: (sceneId: string, updates: Partial<AdminSceneDraft>) => void;
}) {
  const [activeTab, setActiveTab] = useState<VoiceoverTab>("script");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [recordingState, setRecordingState] =
    useState<RecordingState>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const voiceover: AdminVoiceoverDraft = useMemo(
    () => ({
      ...createDefaultVoiceover(),
      ...scene?.voiceover,
    }),
    [scene?.voiceover],
  );

  useEffect(() => {
    if (recordingState !== "recording") return;

    const timer = window.setInterval(() => {
      setRecordingSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [recordingState]);

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  if (!scene) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
        Select a scene to add voiceover.
      </div>
    );
  }

  const selectedScene = scene;

  function updateVoiceover(updates: Partial<AdminVoiceoverDraft>) {
    onUpdateScene(selectedScene.id, {
      voiceover: {
        ...voiceover,
        ...updates,
      },
    });
  }

  function previewVoice() {
    if (!("speechSynthesis" in window)) {
      setVoiceStatus("Browser voice preview is not supported here.");
      return;
    }

    const narration = voiceover.script.trim();

    if (!narration) {
      setVoiceStatus("No narration script added.");
      return;
    }

    const speech = window.speechSynthesis;
    speech.cancel();

    window.setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(narration);
      const voices = speech.getVoices();

      utterance.voice =
        voices.find((voice) => voice.default) ??
        voices.find((voice) => voice.lang.startsWith("en-GB")) ??
        voices.find((voice) => voice.lang.startsWith("en")) ??
        null;
      utterance.lang = utterance.voice?.lang ?? "en-US";
      utterance.rate = voiceover.speed || 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setVoiceStatus("Playing browser preview...");
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setVoiceStatus(null);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        if (event.error === "interrupted") return;
        setIsSpeaking(false);
        setVoiceStatus("Voice preview could not play. Try again.");
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      setIsSpeaking(true);
      setVoiceStatus("Starting browser preview...");
      speech.speak(utterance);
    }, 0);
  }

  function stopVoice() {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setVoiceStatus(null);
    utteranceRef.current = null;
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
      setVoiceStatus("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      setRecordingSeconds(0);
      setRecordingState("recording");
      setVoiceStatus("Recording teacher voice...");

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        setRecordingState("processing");
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setRecordingState("idle");
        setVoiceStatus("Recording ready to preview or save.");
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
    } catch {
      setRecordingState("idle");
      setVoiceStatus("Microphone permission was not granted.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
  }

  function saveRecording() {
    if (!recordedUrl) {
      setVoiceStatus("Record audio before saving.");
      return;
    }

    updateVoiceover({
      mode: "recorded",
      audioUrl: recordedUrl,
      originalAudioUrl: recordedUrl,
      durationSeconds: recordingSeconds,
      provider: "browser",
      processingStatus: "idle",
    });
    setRecordingState("saved");
    setVoiceStatus("Recorded teacher audio saved to this scene.");
  }

  function saveUploadedFile(file: File) {
    const url = URL.createObjectURL(file);

    updateVoiceover({
      mode: "uploaded",
      audioUrl: url,
      originalAudioUrl: url,
      durationSeconds: undefined,
      provider: undefined,
      processingStatus: "idle",
    });
    setVoiceStatus(`${file.name} attached to this scene.`);
  }

  function removeAudio() {
    updateVoiceover({
      audioUrl: undefined,
      originalAudioUrl: undefined,
      cleanedAudioUrl: undefined,
      durationSeconds: undefined,
      processingStatus: "idle",
    });
    setRecordedUrl(null);
    setRecordingState("idle");
    setVoiceStatus("Audio removed. The scene can remain silent.");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <div className="flex items-center gap-2">
          <AudioLines className="h-4 w-4 text-[#1557c0]" />
          <h3 className="text-sm font-semibold text-slate-950">
            Scene voiceover
          </h3>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-semibold text-slate-600">
            Attach to scene
          </span>

          <select
            value={scene.id}
            onChange={(event) => onSelectScene(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0]"
          >
            {scenes.map((item, index) => (
              <option key={item.id} value={item.id}>
                Scene {index + 1}: {item.title}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "rounded-lg px-2 py-1.5 text-xs font-semibold transition",
                activeTab === tab.id
                  ? "bg-white text-[#1557c0] shadow-sm"
                  : "text-slate-600 hover:bg-white/70",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "script" ? (
          <div className="mt-4 space-y-3">
            <textarea
              value={voiceover.script}
              onChange={(event) =>
                updateVoiceover({
                  mode: voiceover.mode ?? "generated",
                  provider: voiceover.provider ?? "browser",
                  script: event.target.value,
                })
              }
              className="min-h-[150px] w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-[#1557c0] focus:ring-2 focus:ring-[#1557c0]/10"
              placeholder="Write the narration script the teacher voice should read..."
            />

            <label className="block">
              <span className="text-xs font-semibold text-slate-600">
                Browser preview speed
              </span>

              <select
                value={voiceover.speed}
                onChange={(event) =>
                  updateVoiceover({ speed: Number(event.target.value) })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0]"
              >
                <option value={0.9}>0.9x</option>
                <option value={1}>1.0x</option>
                <option value={1.1}>1.1x</option>
                <option value={1.25}>1.25x</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() =>
                updateVoiceover({
                  captionsEnabled: !voiceover.captionsEnabled,
                })
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#eaf2ff]"
            >
              Captions: {voiceover.captionsEnabled ? "On" : "Off"}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={isSpeaking ? stopVoice : previewVoice}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-[#eaf2ff]"
              >
                {isSpeaking ? (
                  <Square className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                {isSpeaking ? "Stop" : "Preview"}
              </button>

              <button
                type="button"
                onClick={() => {
                  updateVoiceover({
                    mode: voiceover.mode ?? "generated",
                    provider: voiceover.provider ?? "browser",
                    script: voiceover.script,
                    speed: voiceover.speed || 1,
                    captionsEnabled: voiceover.captionsEnabled,
                  });
                  setVoiceStatus("Narration script saved.");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1557c0] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0f46a3]"
              >
                <Save className="h-3.5 w-3.5" />
                Save script
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "record" ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-slate-50 px-3 py-3">
              <p className="text-xs font-semibold text-slate-500">
                Recording duration
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {formatSeconds(recordingSeconds)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={
                  recordingState === "recording"
                    ? stopRecording
                    : startRecording
                }
                className={[
                  "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition",
                  recordingState === "recording"
                    ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                    : "bg-[#1557c0] text-white hover:bg-[#0f46a3]",
                ].join(" ")}
              >
                {recordingState === "recording" ? (
                  <Square className="h-3.5 w-3.5" />
                ) : (
                  <Mic className="h-3.5 w-3.5" />
                )}
                {recordingState === "recording" ? "Stop" : "Start"}
              </button>

              <button
                type="button"
                onClick={saveRecording}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-[#eaf2ff]"
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </button>
            </div>

            {recordedUrl ? (
              <audio controls src={recordedUrl} className="w-full" />
            ) : (
              <p className="rounded-xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600">
                Record microphone audio directly in the browser. Save it to
                make this scene use teacher audio instead of browser TTS.
              </p>
            )}
          </div>
        ) : null}

        {activeTab === "upload" ? (
          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-[#1557c0] hover:bg-[#eaf2ff]">
              <Upload className="h-5 w-5 text-[#1557c0]" />
              <span className="mt-2 text-sm font-semibold text-slate-800">
                Upload MP3, WAV, or M4A
              </span>
              <span className="mt-1 text-xs text-slate-500">
                Real audio overrides browser narration.
              </span>
              <input
                type="file"
                accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) saveUploadedFile(file);
                  event.target.value = "";
                }}
              />
            </label>

            {voiceover.audioUrl ? (
              <div className="space-y-3 rounded-xl bg-slate-50 p-3">
                <audio controls src={voiceover.audioUrl} className="w-full" />
                <button
                  type="button"
                  onClick={removeAudio}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove audio
                </button>
              </div>
            ) : (
              <p className="rounded-xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600">
                No teacher audio attached yet. This scene can stay silent, or
                you can add audio when the final narration is ready.
              </p>
            )}
          </div>
        ) : null}

        {voiceStatus ? (
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {voiceStatus}
          </p>
        ) : null}
      </div>
    </div>
  );
}
