"use client";

import { useEffect, useMemo, useState } from "react";
import { getSampleCurriculum } from "./data/sampleCurriculum";
import { LessonTree } from "./components/sidebar/LessonTree";
import { ScenePlayer } from "./components/player/ScenePlayer";
import { LearningContextDrawer } from "./components/drawer/LearningContextDrawer";
import { LessonWorkspaceShell } from "./components/shell/LessonWorkspaceShell";
import type { DrawerTab } from "./components/shell/LessonWorkspaceFooter";
import { useCaptions } from "./hooks/useCaptions";
import { useLessonNavigation } from "./hooks/useLessonNavigation";
import { useScenePlayer } from "./hooks/useScenePlayer";
import { useVoiceover } from "./hooks/useVoiceover";
import { getSceneStart } from "./utils/timeline";

export default function LearnWorkspacePage() {
  const curriculum = useMemo(() => getSampleCurriculum(), []);
  const defaultLessonId =
    curriculum.topics
      .flatMap((topic) => topic.lessons)
      .find((lesson) => lesson.state === "current")?.id ??
    curriculum.topics[0]?.lessons[0]?.id;

  const [activeLessonId, setActiveLessonId] = useState(defaultLessonId);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [drawerTab, setDrawerTab] = useState<DrawerTab | null>(null);
  const [voiceVolume, setVoiceVolume] = useState(0.75);
  const { lessons, nextLesson, previousLesson } = useLessonNavigation(
    curriculum,
    activeLessonId,
  );
  const activeLesson =
    lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const player = useScenePlayer(activeLesson.scenes);
  const activeCaption = useCaptions(player.scene, player.sceneTime);
  useVoiceover({
    isPlaying: player.isPlaying,
    scene: player.scene,
    volume: voiceVolume,
  });

  const isCheckpointScene =
    player.scene.type === "checkpoint" ||
    player.scene.type === "interactive" ||
    player.scene.type === "quiz";

  useEffect(() => {
    if (isCheckpointScene && player.isPlaying) {
      player.pause();
    }
  }, [isCheckpointScene, player]);

  const continueScene = () => {
    const nextSceneIndex = player.sceneIndex + 1;
    const nextSceneStart =
      nextSceneIndex < activeLesson.scenes.length
        ? getSceneStart(activeLesson.scenes, nextSceneIndex)
        : player.duration;

    player.seek(nextSceneStart);
    player.play();
  };

  return (
    <LessonWorkspaceShell
      curriculum={curriculum}
      nextLesson={nextLesson}
      previousLesson={previousLesson}
      onOpenDrawer={setDrawerTab}
      onSelectLesson={setActiveLessonId}
      sidebar={
        <LessonTree
          activeLessonId={activeLesson.id}
          curriculum={curriculum}
          onSelectLesson={setActiveLessonId}
        />
      }
      canvas={
        <div className="h-full p-5 lg:p-6">
          <ScenePlayer
            caption={activeCaption}
            captionsEnabled={captionsEnabled}
            currentTime={player.currentTime}
            duration={player.duration}
            isPlaying={player.isPlaying}
            onContinueScene={continueScene}
            onSeek={player.seek}
            onToggleCaptions={() => setCaptionsEnabled((enabled) => !enabled)}
            onTogglePlay={player.toggle}
            scene={player.scene}
            setSpeed={player.setSpeed}
            speed={player.speed}
            voiceVolume={voiceVolume}
            onVoiceVolumeChange={setVoiceVolume}
          />
        </div>
      }
      drawer={
        drawerTab ? (
          <LearningContextDrawer
            activeTab={drawerTab}
            lesson={activeLesson}
            onClose={() => setDrawerTab(null)}
            onTabChange={setDrawerTab}
          />
        ) : null
      }
    />
  );
}
