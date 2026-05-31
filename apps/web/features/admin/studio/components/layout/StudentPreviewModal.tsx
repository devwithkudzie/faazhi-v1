"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import type {
  AdminAssessmentDraft,
  AdminAssessmentPartDraft,
  AdminLessonDraft,
  AdminPaperDraft,
  AdminSceneDraft,
} from "@/features/admin/papers/types/paper-workspace.types";
import type {
  AdminSubject,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";
import {
  AssessmentIntroPanel,
  type AssessmentTarget,
} from "@/features/learn/components/assessment/AssessmentIntroPanel";
import { TopicalAssessmentWorkspace } from "@/features/learn/components/assessment/TopicalAssessmentWorkspace";
import { LearningContextDrawer } from "@/features/learn/components/drawer/LearningContextDrawer";
import { ScenePlayer } from "@/features/learn/components/player/ScenePlayer";
import { LessonTree } from "@/features/learn/components/sidebar/LessonTree";
import type { DrawerTab } from "@/features/learn/components/shell/LessonWorkspaceFooter";
import { LessonWorkspaceShell } from "@/features/learn/components/shell/LessonWorkspaceShell";
import { useCaptions } from "@/features/learn/hooks/useCaptions";
import { useLessonNavigation } from "@/features/learn/hooks/useLessonNavigation";
import { useSceneAudio } from "@/features/learn/hooks/useSceneAudio";
import { useScenePlayer } from "@/features/learn/hooks/useScenePlayer";
import { useVoiceover } from "@/features/learn/hooks/useVoiceover";
import type {
  LearnCurriculum,
  LessonNode,
  Scene,
  PaperQuestion,
  SceneVisualBlock,
  SceneType,
} from "@/features/learn/types";
import { getSceneStart } from "@/features/learn/utils/timeline";

function getBlockText(content: string | string[]) {
  const text = Array.isArray(content) ? content.join(" ") : content;

  return text
    .replace(/<li[^>]*>/g, " ")
    .replace(/<\/(p|h1|h2|h3|li|blockquote)>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function getCodeBlockText(content: string | string[]) {
  const text = Array.isArray(content) ? content.join("\n") : content;

  return text
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/(p|div|li)>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getBlockListItems(content: string | string[]) {
  if (Array.isArray(content)) {
    return content.map((item) => getBlockText(item)).filter(Boolean);
  }

  const listItems = [...content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => getBlockText(match[1]))
    .filter(Boolean);

  if (listItems.length > 0) {
    return listItems;
  }

  return content
    .split("\n")
    .map((item) => getBlockText(item))
    .filter(Boolean);
}

function getSceneType(type: AdminSceneDraft["type"]): SceneType {
  if (type === "exam-extract") return "checkpoint";
  return type;
}

function getVisualBlockType(
  type: string,
): SceneVisualBlock["type"] | undefined {
  if (
    type === "paragraph" ||
    type === "list" ||
    type === "numbered-list" ||
    type === "code" ||
    type === "callout" ||
    type === "quote" ||
    type === "heading" ||
    type === "caption"
  ) {
    return type;
  }

  return undefined;
}

function mapAdminBlockToVisualBlock(
  block: NonNullable<AdminSceneDraft["blocks"]>[number],
  stepStartTimes: Record<number, number>,
): SceneVisualBlock | null {
  const type = getVisualBlockType(block.type);
  if (!type) return null;

  const stepIndex = block.stepIndex ?? 1;
  const startTime = stepStartTimes[stepIndex] ?? block.startTime ?? 0;

  if (type === "list" || type === "numbered-list") {
    const items = getBlockListItems(block.content);

    return {
      id: block.id,
      type,
      text: items.join(" "),
      items,
      stepIndex,
      startTime,
      duration: block.duration,
    };
  }

  return {
    id: block.id,
    type,
    text:
      type === "code"
        ? getCodeBlockText(block.content)
        : getBlockText(block.content),
    stepIndex,
    startTime,
    duration: block.duration,
  };
}

function getStepStartTimes(blocks: NonNullable<AdminSceneDraft["blocks"]>) {
  return blocks.reduce<Record<number, number>>((times, block) => {
    const stepIndex = block.stepIndex ?? 1;
    const startTime = block.startTime ?? 0;

    return {
      ...times,
      [stepIndex]:
        times[stepIndex] === undefined
          ? startTime
          : Math.min(times[stepIndex], startTime),
    };
  }, {});
}

function createCaptions(scene: AdminSceneDraft, narration: string) {
  if (!narration.trim()) {
    return [];
  }

  if (scene.voiceover?.captions?.length) {
    return scene.voiceover.captions.map((caption, index) => ({
      id: `${scene.id}-voiceover-caption-${index}`,
      start: caption.start,
      end: caption.end,
      text: caption.text,
    }));
  }

  return [
    {
      id: `${scene.id}-caption`,
      start: 0,
      end: Math.max(4, getSceneDuration(scene)),
      text: narration,
    },
  ];
}

function getSceneDuration(scene: AdminSceneDraft) {
  const blockDuration = (scene.blocks ?? []).reduce(
    (max, block) =>
      Math.max(max, (block.startTime ?? 0) + (block.duration ?? 6)),
    0,
  );

  return Math.max(blockDuration, 8);
}

function getVoiceoverMode(scene: AdminSceneDraft) {
  if (scene.voiceover?.mode) return scene.voiceover.mode;
  if (scene.voiceover?.audioUrl) return "uploaded";
  return "generated";
}

function mapAssessmentToPaperQuestion(
  assessment?: AdminAssessmentDraft,
): PaperQuestion | undefined {
  const question = assessment?.questions[0];
  if (!question) return undefined;
  const parts = question.parts.flatMap((part) =>
    mapAssessmentPartToPaperQuestionParts(part),
  );

  return {
    answerFields: [],
    markScheme: question.parts.flatMap((part) =>
      part.markScheme.map((point) => ({
        criterion: point.text,
        marks: point.marks,
      })),
    ),
    marks: parts.reduce((total, part) => total + part.marks, 0),
    paperRef: question.source?.paper || assessment.title,
    parts,
    prompt: question.context || question.title,
    questionRef: question.source?.questionRef || `Question ${question.number}`,
  };
}

function mapAssessmentPartToPaperQuestionParts(
  part: AdminAssessmentPartDraft,
  depth = 0,
): NonNullable<PaperQuestion["parts"]> {
  return [
    {
      depth,
      id: part.id,
      label: part.label,
      prompt: part.prompt,
      marks: part.marks,
      answerFields: part.answerSlots.map((slot) => ({
        id: slot.id,
        label: slot.label,
        lines: slot.lines ?? (slot.kind === "short" ? 1 : 4),
        placeholder: slot.placeholder,
      })),
    },
    ...(part.subparts ?? []).flatMap((subpart) =>
      mapAssessmentPartToPaperQuestionParts(subpart, depth + 1),
    ),
  ];
}

function mapAdminSceneToStudentScene(scene: AdminSceneDraft): Scene {
  const blocks = scene.blocks ?? [];
  const stepStartTimes = getStepStartTimes(blocks);
  const blockTexts = blocks.map((block) =>
    getBlockText(block.content),
  );
  const visualBlocks = blocks
    .map((block) => mapAdminBlockToVisualBlock(block, stepStartTimes))
    .filter((block): block is SceneVisualBlock => Boolean(block));
  const narration = scene.voiceover?.script?.trim() ?? "";
  const checkpointBlock = scene.blocks?.find(
    (block) => block.type === "checkpoint",
  );
  const paperQuestion = mapAssessmentToPaperQuestion(scene.assessment);

  return {
    id: scene.id,
    type: getSceneType(scene.type),
    title: scene.title,
    duration: getSceneDuration(scene),
    narration,
    voiceover: scene.voiceover
      ? {
          mode: getVoiceoverMode(scene),
          script: scene.voiceover.script,
          speed: scene.voiceover.speed,
          audioUrl: scene.voiceover.audioUrl,
          durationSeconds: scene.voiceover.durationSeconds,
          provider: scene.voiceover.provider,
          voiceId: scene.voiceover.voiceId,
          captionsEnabled: scene.voiceover.captionsEnabled,
          originalAudioUrl: scene.voiceover.originalAudioUrl,
          cleanedAudioUrl: scene.voiceover.cleanedAudioUrl,
          processingStatus: scene.voiceover.processingStatus,
          captions: scene.voiceover.captions,
        }
      : undefined,
    layout: {
      horizontalAlign: scene.design?.horizontalAlign ?? "center",
      verticalAlign: scene.design?.verticalAlign ?? "center",
    },
    captions: createCaptions(scene, narration),
    blocks:
      blockTexts.length > 0
        ? blockTexts
        : ["No visual content blocks have been added yet."],
    visualBlocks,
    question: checkpointBlock
      ? getBlockText(checkpointBlock.content)
      : paperQuestion
        ? paperQuestion.prompt
      : scene.type === "checkpoint" || scene.type === "exam-extract"
        ? scene.summary
        : undefined,
    choices:
      scene.type === "checkpoint" || scene.type === "exam-extract"
        ? ["Answer option A", "Answer option B", "Answer option C"]
        : undefined,
    answer:
      scene.type === "checkpoint" || scene.type === "exam-extract"
        ? "Answer option A"
        : undefined,
    paperQuestion,
    examinerInsight: scene.summary,
  };
}

function mapAdminLessonToStudentLesson(
  lesson: AdminLessonDraft,
  activeLessonId: string,
): LessonNode {
  return {
    id: lesson.id,
    title: lesson.title,
    kind: "lesson",
    durationLabel: `${Math.max(1, lesson.scenes.length * 3)} min`,
    state: lesson.id === activeLessonId ? "current" : "available",
    scenes:
      lesson.scenes.length > 0
        ? lesson.scenes.map(mapAdminSceneToStudentScene)
        : [
            {
              id: `${lesson.id}-empty-scene`,
              type: "concept",
              title: "Draft lesson",
              eyebrow: "Preview",
              duration: 8,
              narration: "Add scenes to preview this lesson as a student.",
              captions: [],
              blocks: ["Add scenes to preview this lesson as a student."],
            },
          ],
  };
}

export function mapDraftToStudentCurriculum({
  activeLessonId,
  draft,
  paper,
  subject,
}: {
  activeLessonId: string;
  draft: AdminPaperDraft;
  paper: Pick<SubjectPaperSummary, "id" | "title">;
  subject: Pick<AdminSubject, "id" | "name">;
}): LearnCurriculum {
  return {
    subjectId: subject.id,
    subjectTitle: subject.name,
    moduleId: paper.id,
    moduleTitle: paper.title,
    progress: 0,
    topics: draft.topics.map((topic) => {
      const lessons = topic.subtopics.flatMap((subtopic) =>
        subtopic.lessons.map((lesson) =>
          mapAdminLessonToStudentLesson(lesson, activeLessonId),
        ),
      );

      return {
        id: topic.id,
        title: topic.title,
        lessonCount: lessons.length,
        lessons,
        topicalAssessment: {
          id: `${topic.id}-assessment`,
          title: topic.topicalAssessmentTitle,
          durationLabel: `${topic.topicalAssessment?.durationMinutes ?? 20} min`,
          state: "available",
          assessment: topic.topicalAssessment,
        },
      };
    }),
    moduleAssessment: {
      id: `${paper.id}-module-assessment`,
      title: draft.moduleAssessmentTitle,
      durationLabel: `${draft.moduleAssessment?.durationMinutes ?? 60} min`,
      state: "available",
      assessment: draft.moduleAssessment,
    },
  };
}

function StudentPreviewWorkspace({
  activeLessonId: initialActiveLessonId,
  draft,
  paper,
  subject,
}: {
  activeLessonId: string;
  draft: AdminPaperDraft;
  paper: SubjectPaperSummary;
  subject: AdminSubject;
}) {
  const [activeLessonId, setActiveLessonId] = useState(initialActiveLessonId);
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
  const curriculum = useMemo(
    () =>
      mapDraftToStudentCurriculum({
        activeLessonId,
        draft,
        paper,
        subject,
      }),
    [activeLessonId, draft, paper, subject],
  );
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
  const isCheckpointScene =
    player.scene.type === "checkpoint" ||
    player.scene.type === "interactive" ||
    player.scene.type === "quiz";

  useVoiceover({
    enabled: !sceneAudio.hasAudio,
    isPlaying: player.isPlaying,
    scene: player.scene,
    volume: voiceVolume,
  });

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
  }, [activeLesson.id, player.currentTime, player.duration]);

  function continueScene() {
    const nextSceneIndex = player.sceneIndex + 1;
    const nextSceneStart =
      nextSceneIndex < activeLesson.scenes.length
        ? getSceneStart(activeLesson.scenes, nextSceneIndex)
        : player.duration;

    player.seek(nextSceneStart);
    player.play();
  }

  function selectLesson(lessonId: string) {
    setSelectedAssessment(null);
    setActiveLessonId(lessonId);
  }

  return (
    <>
      <LessonWorkspaceShell
        curriculum={curriculum}
        isSidebarOpen={isLessonTreeOpen}
        nextLesson={nextLesson}
        previousLesson={previousLesson}
        onOpenDrawer={setDrawerTab}
        onOpenSidebar={() => setIsLessonTreeOpen(true)}
        onSelectLesson={selectLesson}
        previewMode
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
              onSelectLesson={selectLesson}
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
        <div className="assessment-slide-in fixed inset-0 z-[10020] bg-white">
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

export function StudentPreviewModal({
  activeLessonId,
  draft,
  onClose,
  open,
  paper,
  subject,
}: {
  activeLessonId: string;
  draft: AdminPaperDraft;
  onClose: () => void;
  open: boolean;
  paper: SubjectPaperSummary;
  subject: AdminSubject;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 p-3 backdrop-blur-sm">
      <div className="relative h-full overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-[10010] grid h-10 w-10 place-items-center rounded-full bg-white text-slate-500 shadow-lg ring-1 ring-slate-200 transition hover:bg-[#eaf2ff] hover:text-[#1557c0]"
          aria-label="Close preview"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <StudentPreviewWorkspace
          activeLessonId={activeLessonId}
          draft={draft}
          paper={paper}
          subject={subject}
        />
      </div>
    </div>
  );
}
