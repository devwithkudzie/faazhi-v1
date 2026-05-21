import type {
  AdminLessonDraft,
  AdminPaperDraft,
  AdminSceneDraft,
  AdminSceneType,
} from "@/features/admin/papers/types/paper-workspace.types";
import { CurriculumTool } from "@/features/admin/studio/components/tools/CurriculumTool";
import { JsonTool } from "@/features/admin/studio/components/tools/JsonTool";
import { SceneTool } from "@/features/admin/studio/components/tools/SceneTool";
import { VoiceoverTool } from "@/features/admin/studio/components/tools/VoiceoverTool";
import type { StudioTool } from "@/features/admin/studio/components/layout/StudioToolRail";

type MoveDirection = "up" | "down";

const toolTitles: Record<StudioTool, string> = {
  "lesson-tree": "Lesson tree",
  scenes: "Scenes",
  blocks: "Scene blocks",
  interactions: "Interactions",
  assessments: "Assessments",
  voiceover: "Voiceover",
  media: "Media",
  templates: "Templates",
  json: "JSON",
  preview: "Preview",
};

export function StudioToolSidebar({
  activeLessonId,
  draft,
  onCreateScene,
  onCreateTopic,
  onCreateLesson,
  onMoveTopic,
  onMoveLesson,
  onSelectLesson,
  onSelectScene,
  onUpdateScene,
  scene,
  scenes,
  storageKey,
  tool,
}: {
  activeLessonId?: string;
  draft: AdminPaperDraft;
  onCreateScene: (type: AdminSceneType) => void;
  onCreateTopic: (title: string) => void;
  onCreateLesson: (subtopicId: string, title: string) => void;
  onMoveTopic: (topicId: string, direction: MoveDirection) => void;
  onMoveLesson: (
    subtopicId: string,
    lessonId: string,
    direction: MoveDirection,
  ) => void;
  onSelectLesson: (lesson: AdminLessonDraft) => void;
  onSelectScene: (sceneId: string) => void;
  onUpdateScene: (sceneId: string, updates: Partial<AdminSceneDraft>) => void;
  scene?: AdminSceneDraft;
  scenes: AdminSceneDraft[];
  storageKey: string;
  tool: StudioTool;
}) {
  return (
    <aside className="w-[320px] shrink-0 overflow-y-auto border-r border-slate-200 bg-[#fbfcfe] p-4">
      <h2 className="text-lg font-semibold text-slate-950">
        {toolTitles[tool]}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Build structured learning scenes, not free-form designs.
      </p>

      <div className="mt-5">
        {tool === "lesson-tree" ? (
          <CurriculumTool
            activeLessonId={activeLessonId}
            draft={draft}
            onSelectLesson={onSelectLesson}
            onCreateTopic={onCreateTopic}
            onCreateLesson={onCreateLesson}
            onMoveTopic={onMoveTopic}
            onMoveLesson={onMoveLesson}
          />
        ) : null}

        {tool === "scenes" ||
        tool === "blocks" ||
        tool === "interactions" ||
        tool === "assessments" ? (
          <SceneTool onCreateScene={onCreateScene} scene={scene} />
        ) : null}

        {tool === "json" ? (
          <JsonTool draft={draft} storageKey={storageKey} />
        ) : null}

        {tool === "voiceover" ? (
          <VoiceoverTool
            scene={scene}
            scenes={scenes}
            onSelectScene={onSelectScene}
            onUpdateScene={onUpdateScene}
          />
        ) : null}
      </div>
    </aside>
  );
}