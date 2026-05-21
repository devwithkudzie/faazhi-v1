"use client";

import { useState } from "react";
import { AudioLines, Play, Square, WandSparkles } from "lucide-react";
import type {
  AdminSceneDraft,
  AdminVoiceoverDraft,
} from "@/features/admin/papers/types/paper-workspace.types";

const defaultScript =
  "In this scene, we introduce the main idea step by step. Listen carefully, then continue to the next scene.";

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
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!scene) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
        Select a scene to add voiceover.
      </div>
    );
  }

const activeScene = scene;

const voiceover: AdminVoiceoverDraft = activeScene.voiceover ?? {
    script: defaultScript,
    voiceId: "browser-default",
    speed: 1,
    captionsEnabled: true,
  };

  function updateVoiceover(updates: Partial<AdminVoiceoverDraft>) {
    onUpdateScene(activeScene.id, {
      voiceover: {
        ...voiceover,
        ...updates,
      },
    });
  }

  function previewVoice() {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(voiceover.script);
    utterance.rate = voiceover.speed;
    utterance.onend = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopVoice() {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
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

        <textarea
          value={voiceover.script}
          onChange={(event) => updateVoiceover({ script: event.target.value })}
          className="mt-4 min-h-[150px] w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-[#1557c0] focus:ring-2 focus:ring-[#1557c0]/10"
          placeholder="Write narration script..."
        />

        <label className="mt-3 block">
          <span className="text-xs font-semibold text-slate-600">Speed</span>

          <select
            value={voiceover.speed}
            onChange={(event) =>
              updateVoiceover({ speed: Number(event.target.value) })
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0]"
          >
            <option value={0.9}>0.9×</option>
            <option value={1}>1.0×</option>
            <option value={1.1}>1.1×</option>
            <option value={1.25}>1.25×</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() =>
            updateVoiceover({
              captionsEnabled: !voiceover.captionsEnabled,
            })
          }
          className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
        >
          Captions: {voiceover.captionsEnabled ? "On" : "Off"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={isSpeaking ? stopVoice : previewVoice}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
        >
          {isSpeaking ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isSpeaking ? "Stop" : "Preview"}
        </button>

        <button
          type="button"
          onClick={() =>
            updateVoiceover({
              script: voiceover.script || defaultScript,
              voiceId: "browser-default",
              speed: voiceover.speed || 1,
              captionsEnabled: true,
            })
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1557c0] px-3 py-2 text-xs font-semibold text-white"
        >
          <WandSparkles className="h-3.5 w-3.5" />
          Save voice
        </button>
      </div>
    </div>
  );
}