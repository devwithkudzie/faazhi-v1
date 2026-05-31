"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  addSceneToLesson,
  normalizePaperDraft,
  updateModuleAssessment,
  updateTopicalAssessment,
} from "@/features/admin/papers/services/paper-workspace.service";
import type {
  AdminAssessmentDraft,
  AdminLessonDraft,
  AdminPaperDraft,
  AdminSceneBlock,
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
import type { ContentTab } from "@/features/admin/studio/components/tools/ContentTool";
import { useActiveEditor } from "@/features/admin/studio/hooks/useActiveEditor";
import type {
  AdminSubject,
  PublishStatus,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";

type MoveDirection = "up" | "down";
type SaveState = "saved" | "dirty" | "saving";
type CanvasMode = "scene" | "assessment";
type SelectedAssessmentTarget =
  | { type: "topical"; topicId: string }
  | { type: "module" };
type WorkspaceSnapshot = {
  draft: AdminPaperDraft;
  savedAt?: string;
};

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

function loadWorkspaceSnapshot(
  key: string,
  initialDraft: AdminPaperDraft,
): WorkspaceSnapshot {
  if (typeof window === "undefined") {
    return { draft: normalizePaperDraft(initialDraft) };
  }

  const saved = window.localStorage.getItem(key);
  if (!saved) return { draft: normalizePaperDraft(initialDraft) };

  try {
    const parsed = JSON.parse(saved) as WorkspaceSnapshot;
    if (
      parsed.draft?.subjectId !== initialDraft.subjectId ||
      parsed.draft?.paperId !== initialDraft.paperId
    ) {
      return { draft: normalizePaperDraft(initialDraft) };
    }

    return {
      ...parsed,
      draft: normalizePaperDraft(parsed.draft),
    };
  } catch {
    return { draft: normalizePaperDraft(initialDraft) };
  }
}

function createSceneBlock(
  blockType: string,
  existingBlocks: AdminSceneBlock[] = [],
): AdminSceneBlock {
  const contentByType: Record<string, string | string[]> = {
    callout: "Key idea",
    checkpoint: "Write your checkpoint question...",
    code: "OUTPUT \"Hello world\"",
    formula: "v = Delta s / Delta t",
    heading: "New heading",
    image: "Image placeholder",
    list: ["First point", "Second point"],
    "numbered-list": ["First step", "Second step"],
    paragraph: "Write your paragraph here...",
    quote: "Important quote or teacher emphasis...",
    caption: "Short supporting caption...",
  };
  const latestEndTime = existingBlocks.reduce(
    (max, block) => Math.max(max, (block.startTime ?? 0) + (block.duration ?? 6)),
    0,
  );
  const nextStepIndex =
    existingBlocks.reduce(
      (max, block) => Math.max(max, block.stepIndex ?? 0),
      0,
    ) + 1;
  const styleByType: Record<string, AdminSceneBlock["style"]> = {
    callout: {
      color: "#123f81",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 22,
      fontWeight: 600,
      lineHeight: 1.45,
    },
    formula: {
      color: "#ffffff",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.25,
    },
    heading: {
      color: "#0f172a",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 40,
      fontWeight: 700,
      lineHeight: 1.12,
    },
    list: {
      color: "#334155",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 19,
      fontWeight: 500,
      lineHeight: 1.55,
    },
    paragraph: {
      color: "#334155",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 19,
      fontWeight: 400,
      lineHeight: 1.65,
    },
    quote: {
      color: "#123f81",
      fontFamily: "Merriweather, Georgia, serif",
      fontSize: 22,
      fontWeight: 600,
      lineHeight: 1.45,
    },
    caption: {
      color: "#64748b",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.4,
    },
  };

  return {
    id: `${blockType}-${Date.now()}`,
    type: blockType,
    content: contentByType[blockType] ?? "",
    style: styleByType[blockType],
    stepIndex: nextStepIndex,
    startTime: latestEndTime,
    duration: 6,
    animation: "fade",
  };
}

export default function LessonStudioPage({
  initialDraft,
  paper,
  subject,
}: {
  initialDraft: AdminPaperDraft;
  paper: SubjectPaperSummary;
  subject: AdminSubject;
}) {
  const { token } = useAuth();
  const workspaceKey = `faazhi.workspace.${subject.id}.${paper.id}`;
  const snapshot = useMemo(
    () => loadWorkspaceSnapshot(workspaceKey, initialDraft),
    [initialDraft, workspaceKey],
  );

  const [activeTool, setActiveTool] = useState<StudioTool>("structure");
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("scene");
  const [selectedAssessmentTarget, setSelectedAssessmentTarget] =
    useState<SelectedAssessmentTarget>({ type: "module" });
  const [activeContentTab, setActiveContentTab] =
    useState<ContentTab>("scene");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedBlockFocusKey, setSelectedBlockFocusKey] = useState(0);
  const {
    clearSelection,
    selectedBlockId,
    selectBlock,
    setActiveEditor,
    setSelectedBlockId,
  } = useActiveEditor();
  const [draft, setDraft] = useState<AdminPaperDraft>(snapshot.draft);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    snapshot.savedAt ?? null,
  );
  const [expandedTopicIds, setExpandedTopicIds] = useState<string[]>(
    snapshot.draft.ui?.expandedTopicIds ??
      (snapshot.draft.topics[0]?.id ? [snapshot.draft.topics[0].id] : []),
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
    snapshot.draft.ui?.activeLessonId ??
      lessons[0]?.id ??
      "binary-number-systems",
  );

  const activeLesson =
    lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];

  const activeTopic = useMemo(
    () =>
      draft.topics.find((topic) =>
        topic.subtopics.some((subtopic) =>
          subtopic.lessons.some(
            (lesson) => lesson.id === activeLesson?.id,
          ),
        ),
      ),
    [activeLesson?.id, draft.topics],
  );

  const lessonScenes = activeLesson?.scenes ?? [];

  const [activeSceneId, setActiveSceneId] = useState(
    snapshot.draft.ui?.activeSceneId ?? lessonScenes[0]?.id ?? scenes[0]?.id ?? "",
  );

  const activeScene =
    lessonScenes.find((scene) => scene.id === activeSceneId) ??
    lessonScenes[0] ??
    scenes[0];
  const activeAssessment =
    selectedAssessmentTarget.type === "module"
      ? draft.moduleAssessment
      : draft.topics.find((topic) => topic.id === selectedAssessmentTarget.topicId)
          ?.topicalAssessment;
  const activeAssessmentLabel =
    selectedAssessmentTarget.type === "module"
      ? draft.moduleAssessmentTitle
      : draft.topics.find((topic) => topic.id === selectedAssessmentTarget.topicId)
          ?.topicalAssessmentTitle;

  function updateActiveAssessment(assessment: AdminAssessmentDraft) {
    if (selectedAssessmentTarget.type === "module") {
      handleUpdateModuleAssessment(assessment);
      return;
    }

    handleUpdateTopicalAssessment(selectedAssessmentTarget.topicId, assessment);
  }

  function handleSelectAssessmentTarget(target: SelectedAssessmentTarget) {
    setSelectedAssessmentTarget(target);
    setCanvasMode("assessment");
  }

  function handleSelectTool(tool: StudioTool) {
    setActiveTool(tool);

    if (tool === "assessment") {
      setCanvasMode("assessment");
    }
  }

  const dirty = saveState === "dirty";

  function updateDraft(
    updater: AdminPaperDraft | ((current: AdminPaperDraft) => AdminPaperDraft),
  ) {
    setSaveState("dirty");
    setDraft((current) => {
      const nextDraft =
        typeof updater === "function"
          ? updater(current)
          : updater;

      return {
        ...nextDraft,
        updatedAt: new Date().toISOString(),
        ui: {
          ...nextDraft.ui,
          activeLessonId,
          activeSceneId,
          expandedTopicIds,
        },
      };
    });
  }

  const persistSnapshot = useCallback((nextState: SaveState = "saved") => {
    const savedAt = new Date().toISOString();
    const snapshotToSave: WorkspaceSnapshot = {
      draft: {
        ...draft,
        ui: {
          ...draft.ui,
          activeLessonId,
          activeSceneId,
          expandedTopicIds,
        },
      },
      savedAt,
    };

    window.localStorage.setItem(workspaceKey, JSON.stringify(snapshotToSave));
    setLastSavedAt(savedAt);
    setSaveState(nextState);
  }, [activeLessonId, activeSceneId, draft, expandedTopicIds, workspaceKey]);

  const handleSave = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    setSaveState("saving");
    const nextDraft: AdminPaperDraft = {
      ...draft,
      ui: {
        ...draft.ui,
        activeLessonId,
        activeSceneId,
        expandedTopicIds,
      },
    };

    try {
      if (token) {
        await apiRequest(`/api/papers/${paper.id}/workspace`, {
          method: "PUT",
          token,
          body: JSON.stringify({ draft: nextDraft }),
        });
      }

      persistSnapshot("saved");
    } catch (error) {
      setSaveState("dirty");
      if (!silent) {
        window.alert(
          error instanceof Error
            ? error.message
            : "Could not save this workspace.",
        );
      }
    }
  }, [activeLessonId, activeSceneId, draft, expandedTopicIds, paper.id, persistSnapshot, token]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      workspaceKey,
      JSON.stringify({
        draft: {
          ...draft,
          ui: {
            ...draft.ui,
            activeLessonId,
            activeSceneId,
            expandedTopicIds,
          },
        },
        savedAt: lastSavedAt ?? undefined,
      } satisfies WorkspaceSnapshot),
    );
  }, [activeLessonId, activeSceneId, draft, expandedTopicIds, lastSavedAt, workspaceKey]);

  useEffect(() => {
    if (!dirty) return;

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!dirty || !token) return;

    const autosave = window.setTimeout(() => {
      void handleSave({ silent: true });
    }, 1200);

    return () => window.clearTimeout(autosave);
  }, [dirty, draft, activeLessonId, activeSceneId, expandedTopicIds, handleSave, token]);

  useEffect(() => {
    if (!dirty || !token) return;

    function saveBeforeLeavingFocus() {
      void handleSave({ silent: true });
    }

    function saveBeforeHiding() {
      if (document.visibilityState === "hidden") {
        saveBeforeLeavingFocus();
      }
    }

    window.addEventListener("blur", saveBeforeLeavingFocus);
    window.addEventListener("pagehide", saveBeforeLeavingFocus);
    document.addEventListener("visibilitychange", saveBeforeHiding);

    return () => {
      window.removeEventListener("blur", saveBeforeLeavingFocus);
      window.removeEventListener("pagehide", saveBeforeLeavingFocus);
      document.removeEventListener("visibilitychange", saveBeforeHiding);
    };
  }, [dirty, handleSave, token]);

  function updateScene(sceneId: string, updates: Partial<AdminSceneDraft>) {
    updateDraft((current) => ({
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
    updateDraft((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({
          ...subtopic,
          lessons: subtopic.lessons.map((lesson) => ({
            ...lesson,
            scenes: lesson.scenes.map((scene) =>
              scene.id === sceneId
                ? (() => {
                    const newBlock = createSceneBlock(
                      blockType,
                      scene.blocks ?? [],
                    );
                    setSelectedBlockId(newBlock.id);

                    return {
                      ...scene,
                      blocks: [...(scene.blocks ?? []), newBlock],
                    };
                  })()
                : scene,
            ),
          })),
        })),
      })),
    }));
  }

  function handleUpdateBlock(
    sceneId: string,
    blockId: string,
    updates: Partial<AdminSceneBlock>,
  ) {
    updateDraft((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({
          ...subtopic,
          lessons: subtopic.lessons.map((lesson) => ({
            ...lesson,
            scenes: lesson.scenes.map((scene) =>
              scene.id === sceneId
                ? {
                    ...scene,
                    blocks: (scene.blocks ?? []).map((block) =>
                      block.id === blockId ? { ...block, ...updates } : block,
                    ),
                  }
                : scene,
            ),
          })),
        })),
      })),
    }));
  }

  function handleDeleteBlock(sceneId: string, blockId: string) {
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
      setActiveEditor(null);
    }

    updateDraft((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({
          ...subtopic,
          lessons: subtopic.lessons.map((lesson) => ({
            ...lesson,
            scenes: lesson.scenes.map((scene) =>
              scene.id === sceneId
                ? {
                    ...scene,
                    blocks: (scene.blocks ?? []).filter(
                      (block) => block.id !== blockId,
                    ),
                  }
                : scene,
            ),
          })),
        })),
      })),
    }));
  }

  function handleDuplicateBlock(sceneId: string, blockId: string) {
    updateDraft((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({
          ...subtopic,
          lessons: subtopic.lessons.map((lesson) => ({
            ...lesson,
            scenes: lesson.scenes.map((scene) => {
              if (scene.id !== sceneId) return scene;

              const sourceBlock = (scene.blocks ?? []).find(
                (block) => block.id === blockId,
              );

              if (!sourceBlock) return scene;

              const duplicatedBlock: AdminSceneBlock = {
                ...sourceBlock,
                id: `${sourceBlock.type}-${Date.now()}`,
                startTime:
                  (sourceBlock.startTime ?? 0) + (sourceBlock.duration ?? 6),
                stepIndex:
                  (scene.blocks ?? []).reduce(
                    (max, block) => Math.max(max, block.stepIndex ?? 0),
                    0,
                  ) + 1,
              };
              setSelectedBlockId(duplicatedBlock.id);

              return {
                ...scene,
                blocks: [...(scene.blocks ?? []), duplicatedBlock],
              };
            }),
          })),
        })),
      })),
    }));
  }

  function handleMoveBlock(
    sceneId: string,
    blockId: string,
    direction: MoveDirection,
  ) {
    updateDraft((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({
          ...subtopic,
          lessons: subtopic.lessons.map((lesson) => ({
            ...lesson,
            scenes: lesson.scenes.map((scene) => {
              if (scene.id !== sceneId) return scene;

              const blocks = scene.blocks ?? [];
              const index = blocks.findIndex((block) => block.id === blockId);

              if (index < 0) return scene;

              return {
                ...scene,
                blocks: moveItem(blocks, index, direction),
              };
            }),
          })),
        })),
      })),
    }));
  }

  function handleCreateScene(type: AdminSceneType) {
    if (!activeLesson?.id) return;

    updateDraft((current) => {
      const nextDraft = addSceneToLesson(current, activeLesson.id, {
        title: `${type.replace("-", " ")} scene`,
        type,
        summary: `Draft ${type.replace("-", " ")} content block for this learning scene.`,
      });

      const nextLesson = nextDraft.topics
        .flatMap((topic) =>
          topic.subtopics.flatMap((subtopic) => subtopic.lessons),
        )
        .find((lesson) => lesson.id === activeLesson.id);
      const nextScene = nextLesson?.scenes.at(-1);

      if (nextScene) {
        setActiveSceneId(nextScene.id);
        setCanvasMode("scene");
        setSaveState("dirty");
      }

      return nextDraft;
    });
  }

  function handleSelectScene(scene: AdminSceneDraft) {
    setActiveSceneId(scene.id);
    setCanvasMode("scene");
    setSaveState("dirty");
    clearSelection();
  }

  function handleSelectSceneById(sceneId: string) {
    setActiveSceneId(sceneId);
    setCanvasMode("scene");
    setSaveState("dirty");
    clearSelection();
  }

  function handleRenameScene(sceneId: string, title: string) {
    updateScene(sceneId, { title });
  }

  function handleDeleteScene(sceneId: string) {
    updateDraft((current) => ({
      ...current,
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({
          ...subtopic,
          lessons: subtopic.lessons.map((lesson) => ({
            ...lesson,
            scenes: lesson.scenes.filter((scene) => scene.id !== sceneId),
          })),
        })),
      })),
    }));

    if (activeSceneId === sceneId) {
      setActiveSceneId(lessonScenes.find((scene) => scene.id !== sceneId)?.id ?? "");
      setSaveState("dirty");
    }
  }

  function handleMoveScene(sceneId: string, direction: MoveDirection) {
    updateDraft((current) => ({
      ...current,
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({
          ...subtopic,
          lessons: subtopic.lessons.map((lesson) => {
            const index = lesson.scenes.findIndex(
              (scene) => scene.id === sceneId,
            );

            if (index < 0) return lesson;

            return {
              ...lesson,
              scenes: moveItem(lesson.scenes, index, direction),
            };
          }),
        })),
      })),
    }));
  }

  function handleSelectLesson(lesson: AdminLessonDraft) {
    setActiveLessonId(lesson.id);
    setActiveSceneId(lesson.scenes[0]?.id ?? "");
    setCanvasMode("scene");
    setSaveState("dirty");
    clearSelection();
  }

  function handleToggleTopic(topicId: string) {
    setExpandedTopicIds((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId],
    );
    setSaveState("dirty");
  }

  function handleSelectBlock(blockId: string) {
    setActiveTool("text");
    selectBlock(blockId);
    setSelectedBlockFocusKey((current) => current + 1);
  }

  function handleHighlightBlock(blockId: string) {
    selectBlock(blockId);
    setSelectedBlockFocusKey((current) => current + 1);
  }

  function handleDeselectBlock() {
    clearSelection();
  }

  function handleCreateTopic(title: string) {
    const topicId = makeId(title);

    updateDraft((current) => ({
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
              status: "draft",
              lessons: [],
            },
          ],
        },
      ],
    }));
  }

  function handleRenameTopic(topicId: string, title: string) {
    updateDraft((current) => ({
      ...current,
      topics: current.topics.map((topic) =>
        topic.id === topicId ? { ...topic, title } : topic,
      ),
    }));
  }

  function handleUpdateTopicStatus(topicId: string, status: PublishStatus) {
    updateDraft((current) => ({
      ...current,
      topics: current.topics.map((topic) =>
        topic.id === topicId ? { ...topic, status } : topic,
      ),
    }));
  }

  function handleUpdateTopicalAssessment(
    topicId: string,
    assessment: AdminAssessmentDraft,
  ) {
    updateDraft((current) =>
      updateTopicalAssessment(current, topicId, assessment),
    );
  }

  function handleUpdateModuleAssessment(assessment: AdminAssessmentDraft) {
    updateDraft((current) => updateModuleAssessment(current, assessment));
  }

  function handleDeleteTopic(topicId: string) {
    updateDraft((current) => ({
      ...current,
      topics: current.topics.filter((topic) => topic.id !== topicId),
    }));
  }

  async function handleCreateLesson(subtopicId: string, title: string) {
    let lessonId = makeId(title);

    if (token) {
      const result = await apiRequest<{ lesson: { id: string } }>(
        `/api/papers/${paper.id}/lessons`,
        {
          method: "POST",
          token,
          body: JSON.stringify({
            title,
            description: "",
            status: "draft",
            estimatedMinutes: 10,
          }),
        },
      ).catch(() => null);
      lessonId = result?.lesson.id ?? lessonId;
    }

    const lesson: AdminLessonDraft = {
      id: lessonId,
      title,
      status: "draft",
      scenes: [],
    };

    updateDraft((current) => ({
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
    setSaveState("dirty");
  }

  function handleRenameLesson(lessonId: string, title: string) {
    updateDraft((current) => ({
      ...current,
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({
          ...subtopic,
          lessons: subtopic.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, title } : lesson,
          ),
        })),
      })),
    }));
  }

  function handleDeleteLesson(lessonId: string) {
    updateDraft((current) => ({
      ...current,
      topics: current.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({
          ...subtopic,
          lessons: subtopic.lessons.filter((lesson) => lesson.id !== lessonId),
        })),
      })),
    }));

    if (activeLessonId === lessonId) {
      setActiveLessonId(lessons.find((lesson) => lesson.id !== lessonId)?.id ?? "");
      setSaveState("dirty");
    }
  }

  function handleMoveTopic(topicId: string, direction: MoveDirection) {
    updateDraft((current) => {
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
    updateDraft((current) => ({
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

  function handleUpdateSubjectMeta(
    updates: NonNullable<AdminPaperDraft["subjectMeta"]>,
  ) {
    updateDraft((current) => ({
      ...current,
      subjectMeta: updates,
    }));
  }

  function handleUpdatePaperMeta(
    updates: NonNullable<AdminPaperDraft["paperMeta"]>,
  ) {
    updateDraft((current) => ({
      ...current,
      paperMeta: updates,
    }));
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eef3f8] text-slate-950">
      <StudioToolbar
        dirty={dirty}
        lastSavedAt={lastSavedAt}
        onSave={() => void handleSave()}
        onOpenPreview={() => setPreviewOpen(true)}
        paper={paper}
        saveState={saveState}
        subject={subject}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <StudioToolRail activeTool={activeTool} onSelectTool={handleSelectTool} />

        <StudioToolSidebar
          activeLessonId={activeLesson?.id}
          activeContentTab={activeContentTab}
          draft={draft}
          expandedTopicIds={expandedTopicIds}
          onCreateScene={handleCreateScene}
          onCreateTopic={handleCreateTopic}
          onCreateLesson={handleCreateLesson}
          onDeleteLesson={handleDeleteLesson}
          onDeleteTopic={handleDeleteTopic}
          onMoveTopic={handleMoveTopic}
          onMoveLesson={handleMoveLesson}
          onRenameLesson={handleRenameLesson}
          onRenameTopic={handleRenameTopic}
          onUpdateModuleAssessment={handleUpdateModuleAssessment}
          onUpdateTopicalAssessment={handleUpdateTopicalAssessment}
          onSelectAssessmentTarget={handleSelectAssessmentTarget}
          onUpdateTopicStatus={handleUpdateTopicStatus}
          onSelectBlock={handleHighlightBlock}
          onSelectLesson={handleSelectLesson}
          onSelectScene={handleSelectSceneById}
          onUpdateScene={updateScene}
          onAddBlock={handleAddBlock}
          onActiveContentTabChange={setActiveContentTab}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onMoveBlock={handleMoveBlock}
          onToggleTopic={handleToggleTopic}
          scene={activeScene}
          selectedBlockFocusKey={selectedBlockFocusKey}
          selectedBlockId={selectedBlockId}
          scenes={lessonScenes}
          selectedAssessmentTarget={selectedAssessmentTarget}
          storageKey={`api:${subject.id}:${paper.id}`}
          tool={activeTool}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <StudioCanvas
            assessment={activeAssessment}
            assessmentLabel={activeAssessmentLabel}
            canvasMode={canvasMode}
            lessonTitle={activeLesson?.title ?? "Untitled lesson"}
            onAssessmentChange={updateActiveAssessment}
            onActiveEditorChange={setActiveEditor}
            onDeleteBlock={handleDeleteBlock}
            onDeselectBlock={handleDeselectBlock}
            onRenameScene={handleRenameScene}
            onSelectBlock={handleSelectBlock}
            onUpdateSceneAssessment={(sceneId, assessment) =>
              updateScene(sceneId, { assessment })
            }
            onUpdateBlock={handleUpdateBlock}
            scene={activeScene}
            selectedBlockId={selectedBlockId}
            topicTitle={activeTopic?.title}
          />

          <StudioTimeline
            lessonTitle={activeLesson?.title ?? "Untitled lesson"}
            onCreateScene={handleCreateScene}
            onDeleteScene={handleDeleteScene}
            onMoveScene={handleMoveScene}
            onRenameScene={handleRenameScene}
            onSelectScene={handleSelectScene}
            activeSceneId={activeScene?.id}
            scenes={lessonScenes}
          />
        </div>

        <PropertiesPanel
          draft={draft}
          lesson={activeLesson}
          onUpdatePaperMeta={handleUpdatePaperMeta}
          onUpdateSubjectMeta={handleUpdateSubjectMeta}
          scene={activeScene}
        />
      </div>

      <StudentPreviewModal
        activeLessonId={activeLesson?.id ?? ""}
        draft={draft}
        onClose={() => setPreviewOpen(false)}
        open={previewOpen}
        paper={paper}
        subject={subject}
      />
    </div>
  );
}
