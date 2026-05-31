"use client";

import { useEffect, useMemo, useState } from "react";

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
import { useSceneAudio } from "./hooks/useSceneAudio";
import { useScenePlayer } from "./hooks/useScenePlayer";
import { useVoiceover } from "./hooks/useVoiceover";
import {
  buildLearnCurriculumFromApi,
  type ApiLesson,
  type ApiLessonDetail,
  type ApiPaper,
  type ApiSubject,
} from "./services/api-curriculum";
import { mapDraftToStudentCurriculum } from "@/features/admin/studio/components/layout/StudentPreviewModal";
import type { AdminPaperDraft } from "@/features/admin/papers/types/paper-workspace.types";
import { getPaperDurationMinutes } from "@/features/admin/papers/services/paper-workspace.service";
import type { LearnCurriculum } from "./types";
import { getSceneStart } from "./utils/timeline";
import { apiRequest } from "@/shared/api/client";
import { AppShell } from "@/shared/components/layout/AppShell";
import { useAuth } from "@/shared/providers/AuthProvider";

type PaperIntro = {
  description: string;
  learningOutcomes: string[];
  skills: string[];
  contactMinutes: number;
  topics: string[];
};

function readLocalDraft(subjectId: string, paperId: string) {
  if (typeof window === "undefined") return null;
  const saved =
    window.localStorage.getItem(`faazhi.workspace.${subjectId}.${paperId}`) ??
    window.localStorage.getItem(
      `faazhi.admin.paper-draft.${subjectId}.${paperId}`,
    );
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as { draft?: AdminPaperDraft } | AdminPaperDraft;
    if ("draft" in parsed && parsed.draft) return parsed.draft;
    return "subjectId" in parsed ? parsed : null;
  } catch {
    return null;
  }
}

function introFromDraft(draft: AdminPaperDraft): PaperIntro {
  return {
    description:
      draft.paperMeta?.description ||
      "A scene-based paper pathway with lessons, examples, and checkpoints.",
    learningOutcomes: draft.paperMeta?.learningOutcomes?.length
      ? draft.paperMeta.learningOutcomes
      : draft.subjectMeta?.learningOutcomes ?? [],
    skills: draft.paperMeta?.skills?.length
      ? draft.paperMeta.skills
      : draft.subjectMeta?.skills ?? [],
    contactMinutes: getPaperDurationMinutes(draft),
    topics: draft.topics
      .filter((topic) => (topic.status ?? "draft") === "published")
      .map((topic) => topic.title),
  };
}

function formatContactTime(minutes: number) {
  if (minutes <= 0) return "To be planned";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export default function LearnWorkspacePage({
  paperId,
  subjectId,
}: {
  paperId?: string;
  subjectId: string;
}) {
  const { token } = useAuth();
  const [curriculum, setCurriculum] = useState<LearnCurriculum | null>(null);
  const [paperIntro, setPaperIntro] = useState<PaperIntro | null>(null);
  const [showPaperIntro, setShowPaperIntro] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
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
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadCurriculum() {
      const [subjectResult, paperResult] = await Promise.all([
        apiRequest<{ subject: ApiSubject }>(`/api/subjects/${subjectId}`, {
          token,
        }),
        apiRequest<{ papers: ApiPaper[] }>(`/api/subjects/${subjectId}/papers`, {
          token,
        }),
      ]);
      const selectedPaper =
        paperResult.papers.find((paper) => paper.id === paperId) ??
        paperResult.papers[0];

      if (!selectedPaper) {
        throw new Error("No published papers are available for this subject.");
      }

      const workspaceResult = await apiRequest<{
        workspace: AdminPaperDraft | null;
      }>(`/api/papers/${selectedPaper.id}/workspace`, { token }).catch(
        () => ({ workspace: null }),
      );
      const savedDraft =
        workspaceResult.workspace ?? readLocalDraft(subjectId, selectedPaper.id);
      const draftCurriculum = savedDraft
        ? mapDraftToStudentCurriculum({
            activeLessonId:
              savedDraft.ui?.activeLessonId ??
              savedDraft.topics[0]?.subtopics[0]?.lessons[0]?.id ??
              "",
            draft: savedDraft,
            paper: selectedPaper,
            subject: subjectResult.subject,
          })
        : null;
      const nextCurriculum =
        draftCurriculum && draftCurriculum.topics.length
          ? draftCurriculum
          : buildLearnCurriculumFromApi({
              lessonDetails: await Promise.all(
                (
                  await apiRequest<{ lessons: ApiLesson[] }>(
                    `/api/papers/${selectedPaper.id}/lessons`,
                    { token },
                  )
                ).lessons.map((lesson) =>
                  apiRequest<ApiLessonDetail>(`/api/lessons/${lesson.id}`, {
                    token,
                  }),
                ),
              ),
              paper: selectedPaper,
              subject: subjectResult.subject,
            });
      const firstLessonId = nextCurriculum.topics[0]?.lessons[0]?.id;

      if (!firstLessonId) {
        throw new Error("No published lessons are available for this paper yet.");
      }

      if (!cancelled) {
        setCurriculum(nextCurriculum);
        setPaperIntro(
          savedDraft
            ? introFromDraft(savedDraft)
            : {
                description:
                  selectedPaper.description ||
                  "A scene-based paper pathway with lessons, examples, and checkpoints.",
                learningOutcomes: [
                  `Understand the main concepts in ${selectedPaper.title}.`,
                  "Apply ideas through worked examples.",
                  "Use checkpoints to test understanding.",
                ],
                skills: ["Concept fluency", "Application", "Reflection"],
                contactMinutes: nextCurriculum.topics.reduce(
                  (total, topic) =>
                    total +
                    topic.lessons.reduce(
                      (lessonTotal, lesson) =>
                        lessonTotal +
                        lesson.scenes.reduce(
                          (sceneTotal, scene) =>
                            sceneTotal + Math.ceil(scene.duration / 60),
                          0,
                        ),
                      0,
                    ),
                  0,
                ),
                topics: nextCurriculum.topics.map((topic) => topic.title),
              },
        );
        setActiveLessonId(firstLessonId);
        setError(null);
      }
    }

    loadCurriculum().catch((caughtError) => {
      if (!cancelled) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not load this lesson workspace.",
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [paperId, subjectId, token]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md bg-white p-6 text-sm font-semibold text-rose-700 shadow-xl ring-1 ring-rose-100">
          {error}
        </div>
      </div>
    );
  }

  if (!curriculum || !activeLessonId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-500">
        Loading lesson workspace...
      </div>
    );
  }

  if (showPaperIntro) {
    return (
      <PaperModuleIntro
        curriculum={curriculum}
        intro={paperIntro}
        onContinue={() => setShowPaperIntro(false)}
      />
    );
  }

  return (
    <LearnWorkspaceExperience
      activeLessonId={activeLessonId}
      activeAssessment={activeAssessment}
      captionsEnabled={captionsEnabled}
      completedLessonIds={completedLessonIds}
      curriculum={curriculum}
      drawerTab={drawerTab}
      isLessonTreeOpen={isLessonTreeOpen}
      selectedAssessment={selectedAssessment}
      setActiveAssessment={setActiveAssessment}
      setActiveLessonId={setActiveLessonId}
      setCaptionsEnabled={setCaptionsEnabled}
      setCompletedLessonIds={setCompletedLessonIds}
      setDrawerTab={setDrawerTab}
      setIsLessonTreeOpen={setIsLessonTreeOpen}
      setSelectedAssessment={setSelectedAssessment}
      setVoiceVolume={setVoiceVolume}
      voiceVolume={voiceVolume}
    />
  );
}

function PaperModuleIntro({
  curriculum,
  intro,
  onContinue,
}: {
  curriculum: LearnCurriculum;
  intro: PaperIntro | null;
  onContinue: () => void;
}) {
  const topics = intro?.topics.length
    ? intro.topics
    : curriculum.topics.map((topic) => topic.title);

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
        <section className="bg-[#eef5ff] p-8 shadow-[0_20px_70px_rgba(37,99,235,0.12)]">
          <p className="text-sm font-semibold text-[#1557c0]">
            {curriculum.subjectTitle}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {curriculum.moduleTitle}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {intro?.description}
          </p>
          <p className="mt-4 text-sm font-semibold text-[#1557c0]">
            Estimated contact time: {formatContactTime(intro?.contactMinutes ?? 0)}
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.07)]">
            <h2 className="text-lg font-semibold">What you will learn</h2>
            <ul className="mt-4 space-y-3">
              {(intro?.learningOutcomes ?? []).map((outcome) => (
                <li key={outcome} className="text-sm leading-6 text-slate-600">
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.07)]">
            <h2 className="text-lg font-semibold">Skills you will gain</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(intro?.skills ?? []).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#1557c0]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.07)]">
          <h2 className="text-lg font-semibold">Main topics</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {topics.map((topic) => (
              <div key={topic} className="bg-slate-50 px-4 py-3 text-sm">
                {topic}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="mt-6 bg-[#0645ad] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#053a91]"
          >
            Continue learning
          </button>
        </section>
      </section>
    </AppShell>
  );
}

function LearnWorkspaceExperience({
  activeAssessment,
  activeLessonId,
  captionsEnabled,
  completedLessonIds,
  curriculum,
  drawerTab,
  isLessonTreeOpen,
  selectedAssessment,
  setActiveAssessment,
  setActiveLessonId,
  setCaptionsEnabled,
  setCompletedLessonIds,
  setDrawerTab,
  setIsLessonTreeOpen,
  setSelectedAssessment,
  setVoiceVolume,
  voiceVolume,
}: {
  activeAssessment: AssessmentTarget | null;
  activeLessonId: string;
  captionsEnabled: boolean;
  completedLessonIds: string[];
  curriculum: LearnCurriculum;
  drawerTab: DrawerTab | null;
  isLessonTreeOpen: boolean;
  selectedAssessment:
    | { type: "topic"; topicId: string }
    | { type: "module" }
    | null;
  setActiveAssessment: (assessment: AssessmentTarget | null) => void;
  setActiveLessonId: (lessonId: string) => void;
  setCaptionsEnabled: (enabled: boolean | ((current: boolean) => boolean)) => void;
  setCompletedLessonIds: (ids: string[] | ((current: string[]) => string[])) => void;
  setDrawerTab: (tab: DrawerTab | null) => void;
  setIsLessonTreeOpen: (open: boolean) => void;
  setSelectedAssessment: (
    assessment:
      | { type: "topic"; topicId: string }
      | { type: "module" }
      | null,
  ) => void;
  setVoiceVolume: (volume: number) => void;
  voiceVolume: number;
}) {
  const { lessons, nextLesson, previousLesson } = useLessonNavigation(
    curriculum,
    activeLessonId,
  );
  const activeLesson =
    lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const player = useScenePlayer(activeLesson.scenes);
  const checkpointMarkers = useMemo(
    () =>
      activeLesson.scenes
        .map((scene, index) =>
          scene.type === "checkpoint" || scene.type === "quiz"
            ? {
                label: scene.title || "Checkpoint",
                time: getSceneStart(activeLesson.scenes, index),
                type: "checkpoint" as const,
              }
            : null,
        )
        .filter(
          (
            marker,
          ): marker is { label: string; time: number; type: "checkpoint" } =>
            Boolean(marker),
        ),
    [activeLesson.scenes],
  );
  const sceneAudio = useSceneAudio({
    isPlaying: player.isPlaying,
    scene: player.scene,
    volume: voiceVolume,
  });
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
    enabled: !sceneAudio.hasAudio,
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

  useEffect(() => {
    if (player.duration <= 0) return;
    if (player.currentTime / player.duration < 0.85) return;

    const completionUpdate = window.setTimeout(() => {
      setCompletedLessonIds((current) =>
        current.includes(activeLesson.id)
          ? current
          : [...current, activeLesson.id],
      );
    }, 0);

    return () => window.clearTimeout(completionUpdate);
  }, [activeLesson.id, player.currentTime, player.duration, setCompletedLessonIds]);

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
              completedLessonIds={completedLessonIds}
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
                markers={checkpointMarkers}
                onContinueScene={continueScene}
                onSeek={player.seek}
                onToggleCaptions={() =>
                  setCaptionsEnabled((enabled) => !enabled)
                }
                onTogglePlay={player.toggle}
                scene={player.scene}
                sceneTime={player.sceneTime}
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
