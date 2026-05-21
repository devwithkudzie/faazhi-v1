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
import { StudioToolRail, type StudioTool } from "@/features/admin/studio/components/layout/StudioToolRail";
import { StudioToolSidebar } from "@/features/admin/studio/components/layout/StudioToolSidebar";
import type {
  AdminSubject,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";

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

function loadInitialDraft(
  storageKey: string,
  subjectId: string,
  paperId: string,
) {
  const fallbackDraft = createInitialPaperDraft(subjectId, paperId);

  if (typeof window === "undefined") {
    return fallbackDraft;
  }

  const saved = window.localStorage.getItem(storageKey);

  if (!saved) {
    return fallbackDraft;
  }

  try {
    const savedDraft = normalizePaperDraft(JSON.parse(saved) as AdminPaperDraft);

    if (
      savedDraft.subjectId !== subjectId ||
      savedDraft.paperId !== paperId
    ) {
      return fallbackDraft;
    }

    return savedDraft;
  } catch {
    return fallbackDraft;
  }
}

export default function LessonStudioPage({
  paper,
  subject,
}: {
  paper: SubjectPaperSummary;
  subject: AdminSubject;
}) {
  const storageKey = `faazhi.admin.paper-draft.v3.${subject.id}.${paper.id}`;
  const [activeTool, setActiveTool] = useState<StudioTool>("lesson-tree");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draft, setDraft] = useState<AdminPaperDraft>(() =>
    loadInitialDraft(storageKey, subject.id, paper.id),
  );
  const [activeSceneId, setActiveSceneId] = useState("scene-binary-concept");

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(draft, null, 2));
  }, [draft, storageKey]);

  const scenes = useMemo(
    () =>
      draft.topics.flatMap((topic) =>
        topic.subtopics.flatMap((subtopic) =>
          subtopic.lessons.flatMap((lesson) => lesson.scenes),
        ),
      ),
    [draft],
  );
  const lessons = useMemo(
    () =>
      draft.topics.flatMap((topic) =>
        topic.subtopics.flatMap((subtopic) => subtopic.lessons),
      ),
    [draft],
  );
  const [activeLessonId, setActiveLessonId] = useState("binary-number-systems");
  const activeLesson =
    lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const lessonScenes = activeLesson?.scenes ?? [];
  const activeScene =
    lessonScenes.find((scene) => scene.id === activeSceneId) ??
    lessonScenes[0] ??
    scenes[0];

  function handleCreateScene(type: AdminSceneType) {
    setDraft((current) => {
      const nextDraft = addSceneToFirstLesson(current, {
        title: `${type.replace("-", " ")} scene`,
        type,
        summary: `Draft ${type.replace("-", " ")} content block for this learning scene.`,
      });
      const nextScene =
        nextDraft.topics[0]?.subtopics[0]?.lessons[0]?.scenes.at(-1);

      if (nextScene) {
        setActiveSceneId(nextScene.id);
      }

      return nextDraft;
    });
  }

  function handleSelectScene(scene: AdminSceneDraft) {
    setActiveSceneId(scene.id);
  }

  function handleSelectLesson(lesson: AdminLessonDraft) {
    setActiveLessonId(lesson.id);
    setActiveSceneId(lesson.scenes[0]?.id ?? "");
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
          onSelectLesson={handleSelectLesson}
          onUpdateScene={updateScene}
          scene={activeScene}
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
