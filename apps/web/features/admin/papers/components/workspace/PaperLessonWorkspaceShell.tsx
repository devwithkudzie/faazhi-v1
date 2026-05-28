"use client";

import { useEffect, useMemo, useState } from "react";

import { PaperCreationCanvas } from "@/features/admin/papers/components/workspace/PaperCreationCanvas";
import { PaperCreationPanel } from "@/features/admin/papers/components/workspace/PaperCreationPanel";
import { PaperCurriculumPanel } from "@/features/admin/papers/components/workspace/PaperCurriculumPanel";
import { PaperWorkspaceHeader } from "@/features/admin/papers/components/workspace/PaperWorkspaceHeader";
import {
  addSceneToLesson,
  addLesson,
  addTopic,
  addSubtopic,
  createInitialPaperDraft,
  deleteLesson,
  deleteScene,
  deleteSubtopic,
  deleteTopic,
  getPaperDurationMinutes,
  getPaperReadiness,
  moveLesson,
  moveScene,
  moveSubtopic,
  moveTopic,
  normalizePaperDraft,
  renameModuleAssessment,
  renameLesson,
  renameSubtopic,
  renameTopic,
  renameTopicalAssessment,
  updateLessonStatus,
  updatePaperMeta,
  updateScene,
  updateSubjectMeta,
  updateTopicStatus,
  updateWorkspaceUi,
} from "@/features/admin/papers/services/paper-workspace.service";
import type {
  AdminPaperDraft,
  AdminSceneDraft,
  CreateSceneInput,
} from "@/features/admin/papers/types/paper-workspace.types";
import type {
  AdminSubject,
  SubjectPaperSummary,
} from "@/features/admin/subjects/types/subject.types";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

function storageKeyFor(subjectId: string, paperId: string) {
  return `faazhi.workspace.${subjectId}.${paperId}`;
}

function legacyStorageKeyFor(subjectId: string, paperId: string) {
  return `faazhi.admin.paper-draft.${subjectId}.${paperId}`;
}

function readStoredDraft(subjectId: string, paperId: string) {
  if (typeof window === "undefined") return null;

  const storageKey = storageKeyFor(subjectId, paperId);
  const legacyStorageKey = legacyStorageKeyFor(subjectId, paperId);
  const saved =
    window.localStorage.getItem(storageKey) ??
    window.localStorage.getItem(legacyStorageKey);

  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as { draft?: AdminPaperDraft } | AdminPaperDraft;
    const draft =
      "draft" in parsed && parsed.draft
        ? parsed.draft
        : "subjectId" in parsed
          ? parsed
          : null;
    return draft ? normalizePaperDraft(draft) : null;
  } catch {
    return null;
  }
}

function createInitialDraft(subject: AdminSubject, paper: SubjectPaperSummary) {
  const starter = readStoredDraft(subject.id, paper.id);
  const draft = starter ?? createInitialPaperDraft(subject.id, paper.id);
  const normalized = normalizePaperDraft(draft);
  const firstLessonId =
    normalized.ui?.activeLessonId ??
    normalized.topics[0]?.subtopics[0]?.lessons[0]?.id;
  const firstSceneId =
    normalized.ui?.activeSceneId ??
    normalized.topics[0]?.subtopics[0]?.lessons[0]?.scenes[0]?.id;

  return {
    ...normalized,
    ui: {
      ...normalized.ui,
      activeLessonId: firstLessonId,
      activeSceneId: firstSceneId,
      selectedTopicId: normalized.ui?.selectedTopicId ?? normalized.topics[0]?.id,
      expandedTopicIds:
        normalized.ui?.expandedTopicIds ??
        (normalized.topics[0]?.id ? [normalized.topics[0].id] : []),
    },
    subjectMeta: normalized.subjectMeta ?? {
      title: subject.name,
      code: subject.code,
      description: subject.description,
      learningOutcomes: [
        `Understand the core ideas in ${subject.name}.`,
        "Connect explanations to exam-style reasoning.",
        "Practise through short scene-based checkpoints.",
      ],
      skills: ["Problem solving", "Structured reasoning", "Exam technique"],
      status: subject.status,
    },
    paperMeta: normalized.paperMeta ?? {
      title: paper.title,
      description: "Starter module with sample curriculum structure for content authors.",
      learningOutcomes: [
        `Explain the main concepts in ${paper.title}.`,
        "Apply ideas through worked examples.",
        "Check understanding through embedded scenes.",
      ],
      skills: ["Concept fluency", "Application", "Reflection"],
      estimatedMinutes: getPaperDurationMinutes(normalized),
      status: paper.status,
    },
  };
}

export function PaperLessonWorkspaceShell({
  paper,
  subject,
}: {
  paper: SubjectPaperSummary;
  subject: AdminSubject;
}) {
  const { token } = useAuth();
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(true);
  const storageKey = storageKeyFor(subject.id, paper.id);
  const [draft, setDraft] = useState<AdminPaperDraft>(() =>
    createInitialDraft(subject, paper),
  );
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(() =>
    JSON.stringify(draft),
  );
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const activeSceneId = draft.ui?.activeSceneId;
  const activeLessonId = draft.ui?.activeLessonId;
  const readiness = getPaperReadiness(draft);
  const hasUnsavedChanges = JSON.stringify(draft) !== lastSavedSnapshot;

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(
        {
          draft,
          savedAt: new Date().toISOString(),
          version: 1,
        },
        null,
        2,
      ),
    );
  }, [draft, storageKey]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const scenes = useMemo(
    () =>
      draft.topics.flatMap((topic) =>
        topic.subtopics.flatMap((subtopic) =>
          subtopic.lessons.flatMap((lesson) => lesson.scenes),
        ),
      ),
    [draft],
  );
  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];
  const activeLesson =
    draft.topics
      .flatMap((topic) => topic.subtopics)
      .flatMap((subtopic) => subtopic.lessons)
      .find((lesson) => lesson.id === activeLessonId) ??
    draft.topics[0]?.subtopics[0]?.lessons[0];

  function handleCreateScene(input: CreateSceneInput) {
    setDraft((current) => {
      const targetLessonId =
        input.lessonId ?? current.ui?.activeLessonId ?? activeLesson?.id;
      if (!targetLessonId) return current;

      const nextDraft = addSceneToLesson(current, targetLessonId, input);
      const nextLesson = nextDraft.topics
        .flatMap((topic) => topic.subtopics)
        .flatMap((subtopic) => subtopic.lessons)
        .find((lesson) => lesson.id === targetLessonId);
      const nextScene = nextLesson?.scenes.at(-1);

      if (nextScene) {
        return updateWorkspaceUi(nextDraft, {
          activeLessonId: targetLessonId,
          activeSceneId: nextScene.id,
        });
      }

      return nextDraft;
    });
  }

  function handleSelectScene(scene: AdminSceneDraft) {
    const lesson = draft.topics
      .flatMap((topic) => topic.subtopics)
      .flatMap((subtopic) => subtopic.lessons)
      .find((item) => item.scenes.some((candidate) => candidate.id === scene.id));

    setDraft((current) =>
      updateWorkspaceUi(current, {
        activeLessonId: lesson?.id,
        activeSceneId: scene.id,
      }),
    );
  }

  async function saveDraft() {
    setSaveState("saving");
    const nextDraft = updatePaperMeta(draft, {
      ...(draft.paperMeta ?? {
        title: paper.title,
        description: "",
        learningOutcomes: [],
        skills: [],
        estimatedMinutes: 0,
        status: paper.status,
      }),
      estimatedMinutes: getPaperDurationMinutes(draft),
    });

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(
        { draft: nextDraft, savedAt: new Date().toISOString(), version: 1 },
        null,
        2,
      ),
    );

    try {
      if (token) {
        await apiRequest(`/api/papers/${paper.id}/workspace`, {
          method: "PUT",
          token,
          body: JSON.stringify({ draft: nextDraft }),
        });
      }
      setDraft(nextDraft);
      setLastSavedSnapshot(JSON.stringify(nextDraft));
      setSaveState("saved");
    } catch {
      setDraft(nextDraft);
      setLastSavedSnapshot(JSON.stringify(nextDraft));
      setSaveState("error");
    }
  }

  const displayPaper = {
    ...paper,
    title: draft.paperMeta?.title ?? paper.title,
    status: draft.paperMeta?.status ?? paper.status,
  };
  const displaySubject = {
    ...subject,
    name: draft.subjectMeta?.title ?? subject.name,
    code: draft.subjectMeta?.code ?? subject.code,
    description: draft.subjectMeta?.description ?? subject.description,
    status: draft.subjectMeta?.status ?? subject.status,
  };
  const effectiveSaveState =
    saveState === "saved" && hasUnsavedChanges ? "dirty" : saveState;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,#f6f8fc_0%,#edf3f8_100%)]">
      <PaperWorkspaceHeader
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={() => void saveDraft()}
        paper={displayPaper}
        saveState={effectiveSaveState}
        subject={displaySubject}
      />

      <div className="flex min-h-0 flex-1 gap-5 overflow-hidden p-5">
        <PaperCurriculumPanel
          isOpen={isCurriculumOpen}
          onClose={() => setIsCurriculumOpen(false)}
          onOpen={() => setIsCurriculumOpen(true)}
          paper={displayPaper}
          subject={displaySubject}
          draft={draft}
          activeSceneId={activeScene?.id}
          activeLessonId={activeLesson?.id}
          readiness={readiness}
          onAddTopic={(title) => setDraft((current) => addTopic(current, title))}
          onSelectScene={handleSelectScene}
          onAddLesson={(topicId, subtopicId, title) =>
            setDraft((current) => addLesson(current, topicId, subtopicId, title))
          }
          onAddSubtopic={(topicId, title) =>
            setDraft((current) => addSubtopic(current, topicId, title))
          }
          onRenameModuleAssessment={(title) =>
            setDraft((current) => renameModuleAssessment(current, title))
          }
          onDeleteLesson={(subtopicId, lessonId) =>
            setDraft((current) => deleteLesson(current, subtopicId, lessonId))
          }
          onDeleteScene={(sceneId) =>
            setDraft((current) => deleteScene(current, sceneId))
          }
          onDeleteSubtopic={(topicId, subtopicId) =>
            setDraft((current) => deleteSubtopic(current, topicId, subtopicId))
          }
          onDeleteTopic={(topicId) =>
            setDraft((current) => deleteTopic(current, topicId))
          }
          onMoveLesson={(subtopicId, lessonId, direction) =>
            setDraft((current) =>
              moveLesson(current, subtopicId, lessonId, direction),
            )
          }
          onMoveScene={(lessonId, sceneId, direction) =>
            setDraft((current) => moveScene(current, lessonId, sceneId, direction))
          }
          onMoveSubtopic={(topicId, subtopicId, direction) =>
            setDraft((current) =>
              moveSubtopic(current, topicId, subtopicId, direction),
            )
          }
          onMoveTopic={(topicId, direction) =>
            setDraft((current) => moveTopic(current, topicId, direction))
          }
          onRenameLesson={(lessonId, title) =>
            setDraft((current) => renameLesson(current, lessonId, title))
          }
          onRenameSubtopic={(subtopicId, title) =>
            setDraft((current) => renameSubtopic(current, subtopicId, title))
          }
          onRenameTopic={(topicId, title) =>
            setDraft((current) => renameTopic(current, topicId, title))
          }
          onRenameTopicalAssessment={(topicId, title) =>
            setDraft((current) =>
              renameTopicalAssessment(current, topicId, title),
            )
          }
          onUpdateLessonStatus={(lessonId, status) =>
            setDraft((current) => updateLessonStatus(current, lessonId, status))
          }
          onUpdateScene={(sceneId, updates) =>
            setDraft((current) => updateScene(current, sceneId, updates))
          }
          onUpdateSubjectMeta={(subjectMeta) =>
            setDraft((current) => updateSubjectMeta(current, subjectMeta))
          }
          onUpdatePaperMeta={(paperMeta) =>
            setDraft((current) => updatePaperMeta(current, paperMeta))
          }
          onUpdateTopicStatus={(topicId, status) =>
            setDraft((current) => updateTopicStatus(current, topicId, status))
          }
          onToggleTopicExpanded={(topicId) =>
            setDraft((current) => {
              const expanded = current.ui?.expandedTopicIds ?? [];
              return updateWorkspaceUi(current, {
                selectedTopicId: topicId,
                expandedTopicIds: expanded.includes(topicId)
                  ? expanded.filter((id) => id !== topicId)
                  : [...expanded, topicId],
              });
            })
          }
        />

        <div className="flex min-w-0 flex-1 overflow-hidden rounded-[28px] bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 backdrop-blur">
          <PaperCreationCanvas draft={draft} scene={activeScene} />
          <PaperCreationPanel
            onCreateScene={handleCreateScene}
            scene={activeScene}
            activeLesson={activeLesson}
            storageKey={storageKey}
          />
        </div>
      </div>
    </div>
  );
}
