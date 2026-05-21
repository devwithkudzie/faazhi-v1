"use client";

import { useEffect, useMemo, useState } from "react";

import { PaperCreationCanvas } from "@/features/admin/papers/components/workspace/PaperCreationCanvas";
import { PaperCreationPanel } from "@/features/admin/papers/components/workspace/PaperCreationPanel";
import { PaperCurriculumPanel } from "@/features/admin/papers/components/workspace/PaperCurriculumPanel";
import { PaperWorkspaceHeader } from "@/features/admin/papers/components/workspace/PaperWorkspaceHeader";
import {
  addLesson,
  addSceneToFirstLesson,
  addSubtopic,
  createInitialPaperDraft,
  normalizePaperDraft,
  renameModuleAssessment,
  renameTopic,
  renameTopicalAssessment,
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

export function PaperLessonWorkspaceShell({
  paper,
  subject,
}: {
  paper: SubjectPaperSummary;
  subject: AdminSubject;
}) {
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(true);
  const storageKey = `faazhi.admin.paper-draft.${subject.id}.${paper.id}`;
  const [draft, setDraft] = useState<AdminPaperDraft>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(storageKey);

      if (saved) {
        try {
          return normalizePaperDraft(JSON.parse(saved) as AdminPaperDraft);
        } catch {
          return createInitialPaperDraft(subject.id, paper.id);
        }
      }
    }

    return createInitialPaperDraft(subject.id, paper.id);
  });
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
  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];

  function handleCreateScene(input: CreateSceneInput) {
    setDraft((current) => {
      const nextDraft = addSceneToFirstLesson(current, input);
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,#f6f8fc_0%,#edf3f8_100%)]">
      <PaperWorkspaceHeader paper={paper} subject={subject} />

      <div className="flex min-h-0 flex-1 gap-5 overflow-hidden p-5">
        <PaperCurriculumPanel
          isOpen={isCurriculumOpen}
          onClose={() => setIsCurriculumOpen(false)}
          onOpen={() => setIsCurriculumOpen(true)}
          paper={paper}
          subject={subject}
          draft={draft}
          activeSceneId={activeScene?.id}
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
          onRenameTopic={(topicId, title) =>
            setDraft((current) => renameTopic(current, topicId, title))
          }
          onRenameTopicalAssessment={(topicId, title) =>
            setDraft((current) =>
              renameTopicalAssessment(current, topicId, title),
            )
          }
        />

        <div className="flex min-w-0 flex-1 overflow-hidden rounded-[28px] bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 backdrop-blur">
          <PaperCreationCanvas draft={draft} scene={activeScene} />
          <PaperCreationPanel
            draft={draft}
            onCreateScene={handleCreateScene}
            scene={activeScene}
            storageKey={storageKey}
          />
        </div>
      </div>
    </div>
  );
}
