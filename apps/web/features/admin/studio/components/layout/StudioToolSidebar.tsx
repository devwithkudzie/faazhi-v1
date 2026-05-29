import type {
  AdminAssessmentDraft,
  AdminLessonDraft,
  AdminPaperDraft,
  AdminSceneBlock,
  AdminSceneDraft,
  AdminSceneType,
} from "@/features/admin/papers/types/paper-workspace.types";
import type { PublishStatus } from "@/features/admin/subjects/types/subject.types";
import {
  AssessmentTool,
} from "@/features/admin/studio/components/tools/AssessmentTool";
import {
  ContentTool,
  type ContentTab,
} from "@/features/admin/studio/components/tools/ContentTool";
import { CurriculumTool } from "@/features/admin/studio/components/tools/CurriculumTool";
import { AnimateTool } from "@/features/admin/studio/components/tools/AnimateTool";
import { DesignTool } from "@/features/admin/studio/components/tools/DesignTool";
import { InteractTool } from "@/features/admin/studio/components/tools/InteractTool";
import { JsonTool } from "@/features/admin/studio/components/tools/JsonTool";
import { MediaTool } from "@/features/admin/studio/components/tools/MediaTool";
import { TextTool } from "@/features/admin/studio/components/tools/TextTool";
import { VoiceoverTool } from "@/features/admin/studio/components/tools/VoiceoverTool";
import type { StudioTool } from "@/features/admin/studio/components/layout/StudioToolRail";

type MoveDirection = "up" | "down";
type SelectedAssessmentTarget =
  | { type: "topical"; topicId: string }
  | { type: "module" };

const toolTitles: Record<StudioTool, string> = {
  structure: "Structure",
  assessment: "Assessments",
  content: "Scene flow",
  text: "Text",
  design: "Design",
  interaction: "Interaction",
  narration: "Narration",
  media: "Media",
  animation: "Animation",
  preview: "Preview",
};

export function StudioToolSidebar({
  activeLessonId,
  activeContentTab,
  draft,
  expandedTopicIds,
  onCreateScene,
  onCreateTopic,
  onCreateLesson,
  onDeleteLesson,
  onDeleteTopic,
  onMoveTopic,
  onMoveLesson,
  onRenameLesson,
  onRenameTopic,
  onSelectAssessmentTarget,
  onUpdateModuleAssessment,
  onUpdateTopicalAssessment,
  onUpdateTopicStatus,
  onSelectLesson,
  onSelectBlock,
  onSelectScene,
  onUpdateScene,
  onAddBlock,
  onActiveContentTabChange,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onToggleTopic,
  scene,
  selectedBlockId,
  scenes,
  selectedAssessmentTarget,
  storageKey,
  tool,
}: {
  activeLessonId?: string;
  activeContentTab: ContentTab;
  draft: AdminPaperDraft;
  expandedTopicIds: string[];
  onCreateScene: (type: AdminSceneType) => void;
  onCreateTopic: (title: string) => void;
  onCreateLesson: (subtopicId: string, title: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onMoveTopic: (topicId: string, direction: MoveDirection) => void;
  onMoveLesson: (
    subtopicId: string,
    lessonId: string,
    direction: MoveDirection,
  ) => void;
  onRenameLesson: (lessonId: string, title: string) => void;
  onRenameTopic: (topicId: string, title: string) => void;
  onSelectAssessmentTarget: (target: SelectedAssessmentTarget) => void;
  onUpdateModuleAssessment: (assessment: AdminAssessmentDraft) => void;
  onUpdateTopicalAssessment: (
    topicId: string,
    assessment: AdminAssessmentDraft,
  ) => void;
  onUpdateTopicStatus: (topicId: string, status: PublishStatus) => void;
  onSelectLesson: (lesson: AdminLessonDraft) => void;
  onSelectBlock: (blockId: string) => void;
  onSelectScene: (sceneId: string) => void;
  onUpdateScene: (sceneId: string, updates: Partial<AdminSceneDraft>) => void;
  onAddBlock: (sceneId: string, blockType: string) => void;
  onActiveContentTabChange: (tab: ContentTab) => void;
  onUpdateBlock: (
    sceneId: string,
    blockId: string,
    updates: Partial<AdminSceneBlock>,
  ) => void;
  onDeleteBlock: (sceneId: string, blockId: string) => void;
  onDuplicateBlock: (sceneId: string, blockId: string) => void;
  onMoveBlock: (
    sceneId: string,
    blockId: string,
    direction: MoveDirection,
  ) => void;
  onToggleTopic: (topicId: string) => void;
  scene?: AdminSceneDraft;
  selectedBlockFocusKey: number;
  selectedBlockId: string | null;
  selectedAssessmentTarget: SelectedAssessmentTarget;
  scenes: AdminSceneDraft[];
  storageKey: string;
  tool: StudioTool;
}) {
  const compact = tool === "text";

  return (
    <aside
      className={[
        "w-[320px] shrink-0 border-r border-slate-200 bg-[#fbfcfe]",
        compact ? "overflow-hidden p-3" : "overflow-y-auto p-4",
      ].join(" ")}
    >
      <h2
        className={[
          "font-semibold text-slate-950",
          compact ? "text-base" : "text-lg",
        ].join(" ")}
      >
        {toolTitles[tool]}
      </h2>

      {compact ? null : (
        <p className="mt-1 text-sm text-slate-500">
          Build structured learning scenes, not free-form designs.
        </p>
      )}

      <div className={compact ? "mt-3" : "mt-5"}>
        {tool === "structure" ? (
          <CurriculumTool
            activeLessonId={activeLessonId}
            draft={draft}
            expandedTopicIds={expandedTopicIds}
            onSelectLesson={onSelectLesson}
            onCreateTopic={onCreateTopic}
            onCreateLesson={onCreateLesson}
            onDeleteLesson={onDeleteLesson}
            onDeleteTopic={onDeleteTopic}
            onMoveTopic={onMoveTopic}
            onMoveLesson={onMoveLesson}
            onRenameLesson={onRenameLesson}
            onRenameTopic={onRenameTopic}
            onSelectAssessmentTarget={onSelectAssessmentTarget}
            onUpdateTopicStatus={onUpdateTopicStatus}
            onToggleTopic={onToggleTopic}
          />
        ) : null}

        {tool === "assessment" ? (
          <AssessmentTool
            draft={draft}
            onUpdateModuleAssessment={onUpdateModuleAssessment}
            onUpdateTopicalAssessment={onUpdateTopicalAssessment}
            selectedTarget={selectedAssessmentTarget}
            onSelectTarget={onSelectAssessmentTarget}
          />
        ) : null}

        {tool === "content" ? (
          <ContentTool
            activeTab={activeContentTab}
            scene={scene}
            onActiveTabChange={onActiveContentTabChange}
            onCreateScene={onCreateScene}
            onUpdateScene={onUpdateScene}
            onUpdateBlock={onUpdateBlock}
            onDeleteBlock={onDeleteBlock}
            onDuplicateBlock={onDuplicateBlock}
            onMoveBlock={onMoveBlock}
            onSelectBlock={onSelectBlock}
          />
        ) : null}

        {tool === "text" ? (
          <TextTool
            onUpdateScene={onUpdateScene}
            scene={scene}
            selectedBlockId={selectedBlockId}
            onAddBlock={onAddBlock}
            onUpdateBlock={onUpdateBlock}
          />
        ) : null}

        {tool === "narration" ? (
          <VoiceoverTool
            scene={scene}
            scenes={scenes}
            onSelectScene={onSelectScene}
            onUpdateScene={onUpdateScene}
          />
        ) : null}

        {tool === "design" ? (
          <DesignTool onUpdateScene={onUpdateScene} scene={scene} />
        ) : null}

        {tool === "interaction" ? (
          <InteractTool onAddBlock={onAddBlock} scene={scene} />
        ) : null}

        {tool === "animation" ? (
          <AnimateTool
            onUpdateBlock={onUpdateBlock}
            onUpdateScene={onUpdateScene}
            scene={scene}
            selectedBlockId={selectedBlockId}
          />
        ) : null}

        {tool === "media" ? (
          <MediaTool />
        ) : null}

        {tool === "preview" ? (
          <JsonTool draft={draft} storageKey={storageKey} />
        ) : null}
      </div>
    </aside>
  );
}
