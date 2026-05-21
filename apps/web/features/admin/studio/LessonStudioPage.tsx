"use client";

import { useEffect, useMemo, useState } from "react";

import {
  addSceneToFirstLesson,
  createInitialPaperDraft,
  normalizePaperDraft,
} from "@/features/admin/papers/services/paper-workspace.service";
import type {
  AdminLessonDraft,
  AdminPaperDraft,
  AdminSceneDraft,
  AdminSceneType,
} from "@/features/admin/papers/types/paper-workspace.types";
import { PropertiesPanel } from "@/features/admin/studio/components/properties/PropertiesPanel";
import { StudentPreviewModal } from "@/features/admin/studio/components/layout/StudentPreviewModal";
import { StudioCanvas } from "@/features/admin/studio/components/layout/StudioCanvas";
import { StudioTimeline } from "@/features/admin/studio/components/timeline/StudioTimeline";
import { StudioToolbar } from "@/features/admin/studio/components/layout/StudioToolbar";
import {
  StudioToolRail,
  type StudioTool,
} from "@/features/admin/studio/components/layout/StudioToolRail";
import { StudioToolSidebar } from "@/features/admin/studio/components/layout/StudioToolSidebar";
import type {
  AdminSubject,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";

type MoveDirection = "up" | "down";

function loadInitialDraft(
  storageKey: string,
  subjectId: string,
  paperId: string,
) {
  const fallbackDraft = createInitialPaperDraft(subjectId, paperId);

  if (typeof window === "undefined") return fallbackDraft;

  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return fallbackDraft;

  try {
    const savedDraft = normalizePaperDraft(JSON.parse(saved) as AdminPaperDraft);

    if (savedDraft.subjectId !== subjectId || savedDraft.paperId !== paperId) {
      return fallbackDraft;
    }

    return savedDraft;
  } catch {
    return fallbackDraft;
  }
}

function makeId(value: string) {
  return `${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
}

function moveItem<T>(items: T[], index: number, direction: MoveDirection) {
  const next = [...items];
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= next.length) return next;

  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export default function LessonStudioPage({
  paper,
  subject,
}: {
  paper: SubjectPaperSummary;
  subject: AdminSubject;
}) {
  const storageKey = `faazhi.admin.paper-draft.v3.${subject.id}.${paper.id}`;

  const [activeTool, setActiveTool] = useState<StudioTool>("structure");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draft, setDraft] = useState<AdminPaperDraft>(() =>
    loadInitialDraft(storageKey, subject.id, paper.id),
  );

  const lessons = useMemo(
    () =>
      draft.topics.flatMap((topic) =>
        topic.subtopics.flatMap((subtopic) => subtopic.lessons),
      ),
    [draft],
  );

  const scenes = useMemo(
    () => lessons.flatMap((lesson) => lesson.scenes),
    [lessons],
  );

  const [activeLessonId, setActiveLessonId] = useState(
    lessons[0]?.id ?? "binary-number-systems",
  );

  const activeLesson =
    lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];

  const lessonScenes = activeLesson?.scenes ?? [];

  const [activeSceneId, setActiveSceneId] = useState(
    lessonScenes[0]?.id ?? scenes[0]?.id ?? "",
  );

  const activeScene =
    lessonScenes.find((scene) => scene.id === activeSceneId) ??
    lessonScenes[0] ??
    scenes[0];

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(draft, null, 2));
  }, [draft, storageKey]);

  function updateScene(sceneId: string, updates: Partial<AdminSceneDraft>) {
    setDraft((current) => ({
      ...current,
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({
          ...subtopic,
          lessons: subtopic.lessons.map((lesson) => ({
            ...lesson,
            scenes: lesson.scenes.map((scene) =>
              scene.id === sceneId ? { ...scene, ...updates } : scene,
            ),
          })),
        })),
      })),
    }));
  }

  function handleAddBlock(sceneId: string, blockType: string) {
  const block = {
    id: `${blockType}-${Date.now()}`,
    type: blockType,
    content:
      blockType === "heading"
        ? "New heading"
        : blockType === "paragraph"
          ? "Write your paragraph here..."
          : blockType === "list"
            ? ["First point", "Second point"]
            : blockType === "formula"
              ? "v = Δs / Δt"
              : blockType === "callout"
                ? "Key idea"
                : blockType === "checkpoint"
                  ? "Write your checkpoint question..."
                  : "",
  };

  updateScene(sceneId, {
    blocks: [...((activeScene?.blocks as any[]) ?? []), block],
  } as any);
}

  function handleCreateScene(type: AdminSceneType) {
    setDraft((current) => {
      const nextDraft = addSceneToFirstLesson(current, {
        title: `${type.replace("-", " ")} scene`,
        type,
        summary: `Draft ${type.replace("-", " ")} content block for this learning scene.`,
      });

      const nextScene =
        nextDraft.topics[0]?.subtopics[0]?.lessons[0]?.scenes.at(-1);

      if (nextScene) setActiveSceneId(nextScene.id);

      return nextDraft;
    });
  }

  function handleSelectScene(scene: AdminSceneDraft) {
    setActiveSceneId(scene.id);
  }

  function handleSelectSceneById(sceneId: string) {
    setActiveSceneId(sceneId);
  }

  function handleSelectLesson(lesson: AdminLessonDraft) {
    setActiveLessonId(lesson.id);
    setActiveSceneId(lesson.scenes[0]?.id ?? "");
  }

  function handleCreateTopic(title: string) {
    const topicId = makeId(title);

    setDraft((current) => ({
      ...current,
      topics: [
        ...current.topics,
        {
          id: topicId,
          title,
          topicalAssessmentTitle: `${title} assessment`,
          subtopics: [
            {
              id: makeId(`${title}-intro`),
              title: "Getting Started",
              lessons: [],
            },
          ],
        },
      ],
    }));
  }

  function handleCreateLesson(subtopicId: string, title: string) {
    const lesson: AdminLessonDraft = {
      id: makeId(title),
      title,
      status: "draft",
      scenes: [],
    };

    setDraft((current) => ({
      ...current,
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) =>
          subtopic.id === subtopicId
            ? { ...subtopic, lessons: [...subtopic.lessons, lesson] }
            : subtopic,
        ),
      })),
    }));

    setActiveLessonId(lesson.id);
  }

  function handleMoveTopic(topicId: string, direction: MoveDirection) {
    setDraft((current) => {
      const index = current.topics.findIndex((topic) => topic.id === topicId);
      if (index < 0) return current;

      return {
        ...current,
        topics: moveItem(current.topics, index, direction),
      };
    });
  }

  function handleMoveLesson(
    subtopicId: string,
    lessonId: string,
    direction: MoveDirection,
  ) {
    setDraft((current) => ({
      ...current,
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => {
          if (subtopic.id !== subtopicId) return subtopic;

          const index = subtopic.lessons.findIndex(
            (lesson) => lesson.id === lessonId,
          );

          if (index < 0) return subtopic;

          return {
            ...subtopic,
            lessons: moveItem(subtopic.lessons, index, direction),
          };
        }),
      })),
    }));
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eef3f8] text-slate-950">
      <StudioToolbar
        onOpenPreview={() => setPreviewOpen(true)}
        paper={paper}
        subject={subject}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <StudioToolRail activeTool={activeTool} onSelectTool={setActiveTool} />

        <StudioToolSidebar
          activeLessonId={activeLesson?.id}
          draft={draft}
          onCreateScene={handleCreateScene}
          onCreateTopic={handleCreateTopic}
          onCreateLesson={handleCreateLesson}
          onMoveTopic={handleMoveTopic}
          onMoveLesson={handleMoveLesson}
          onSelectLesson={handleSelectLesson}
          onSelectScene={handleSelectSceneById}
          onUpdateScene={updateScene}
          onAddBlock={handleAddBlock}
          scene={activeScene}
          scenes={lessonScenes}
          storageKey={storageKey}
          tool={activeTool}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <StudioCanvas scene={activeScene} />

          <StudioTimeline
            lessonTitle={activeLesson?.title ?? "Untitled lesson"}
            onCreateScene={handleCreateScene}
            onSelectScene={handleSelectScene}
            activeSceneId={activeScene?.id}
            scenes={lessonScenes}
          />
        </div>

        <PropertiesPanel lesson={activeLesson} scene={activeScene} />
      </div>

      <StudentPreviewModal
        onClose={() => setPreviewOpen(false)}
        open={previewOpen}
        scene={activeScene}
      />
    </div>
  );
}