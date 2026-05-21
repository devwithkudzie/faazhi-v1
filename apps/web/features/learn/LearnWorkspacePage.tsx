"use client";

import { useEffect, useMemo, useState } from "react";
import { getSampleCurriculum } from "./data/sampleCurriculum";
import { LessonTree } from "./components/sidebar/LessonTree";
import { ScenePlayer } from "./components/player/ScenePlayer";
import { LearningContextDrawer } from "./components/drawer/LearningContextDrawer";
import {
  AssessmentIntroPanel,
  type AssessmentTarget,
} from "./components/assessment/AssessmentIntroPanel";
import { TopicalAssessmentWorkspace } from "./components/assessment/TopicalAssessmentWorkspace";
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
  const [isLessonTreeOpen, setIsLessonTreeOpen] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<
    | { type: "topic"; topicId: string }
    | { type: "module" }
    | null
  >(null);
  const [activeAssessment, setActiveAssessment] =
    useState<AssessmentTarget | null>(null);
  const [voiceVolume, setVoiceVolume] = useState(0.75);
  const { lessons, nextLesson, previousLesson } = useLessonNavigation(
    curriculum,
    activeLessonId,
  );
  const activeLesson =
    lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const player = useScenePlayer(activeLesson.scenes);
  const activeCaption = useCaptions(player.scene, player.sceneTime);
  const selectedAssessmentTopic =
    selectedAssessment?.type === "topic"
      ? curriculum.topics.find((topic) => topic.id === selectedAssessment.topicId)
    : null;
  const selectedAssessmentTarget: AssessmentTarget | null =
    selectedAssessment?.type === "module"
      ? { type: "module", curriculum }
      : selectedAssessmentTopic
        ? { type: "topic", topic: selectedAssessmentTopic }
        : null;
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
    <>
      <LessonWorkspaceShell
        curriculum={curriculum}
        isSidebarOpen={isLessonTreeOpen}
        nextLesson={nextLesson}
        previousLesson={previousLesson}
        onOpenDrawer={setDrawerTab}
        onOpenSidebar={() => setIsLessonTreeOpen(true)}
        onSelectLesson={(lessonId) => {
          setSelectedAssessment(null);
          setActiveLessonId(lessonId);
        }}
        sidebar={
          isLessonTreeOpen ? (
            <LessonTree
              activeLessonId={activeLesson.id}
              curriculum={curriculum}
              onClose={() => setIsLessonTreeOpen(false)}
              onSelectModuleAssessment={() =>
                setSelectedAssessment({ type: "module" })
              }
              onSelectAssessment={(topicId) =>
                setSelectedAssessment({ type: "topic", topicId })
              }
              onSelectLesson={(lessonId) => {
                setSelectedAssessment(null);
                setActiveLessonId(lessonId);
              }}
            />
          ) : null
        }
        canvas={
          <div className="h-full p-5 lg:p-6">
            {selectedAssessmentTarget ? (
              <AssessmentIntroPanel
                assessment={selectedAssessmentTarget}
                onStart={() => setActiveAssessment(selectedAssessmentTarget)}
              />
            ) : (
              <ScenePlayer
                caption={activeCaption}
                captionsEnabled={captionsEnabled}
                currentTime={player.currentTime}
                duration={player.duration}
                isPlaying={player.isPlaying}
                onContinueScene={continueScene}
                onSeek={player.seek}
                onToggleCaptions={() =>
                  setCaptionsEnabled((enabled) => !enabled)
                }
                onTogglePlay={player.toggle}
                scene={player.scene}
                setSpeed={player.setSpeed}
                speed={player.speed}
                voiceVolume={voiceVolume}
                onVoiceVolumeChange={setVoiceVolume}
              />
            )}
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

      {activeAssessment ? (
        <div className="assessment-slide-in fixed inset-0 z-50 bg-white">
          <TopicalAssessmentWorkspace
            curriculum={curriculum}
            mode={activeAssessment.type}
            topic={
              activeAssessment.type === "topic"
                ? activeAssessment.topic
                : undefined
            }
            onBack={() => setActiveAssessment(null)}
          />
        </div>
      ) : null}
    </>
  );
}
