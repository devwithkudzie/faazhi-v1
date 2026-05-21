import type {
  AdminLessonDraft,
  AdminPaperDraft,
  AdminSceneDraft,
  AdminSceneType,
} from "@/features/admin/papers/types/paper-workspace.types";
import { CurriculumTool } from "@/features/admin/studio/components/tools/CurriculumTool";
import { JsonTool } from "@/features/admin/studio/components/tools/JsonTool";
import { ContentTool } from "@/features/admin/studio/components/tools/ContentTool";
import { VoiceoverTool } from "@/features/admin/studio/components/tools/VoiceoverTool";
import type { StudioTool } from "@/features/admin/studio/components/layout/StudioToolRail";

type MoveDirection = "up" | "down";

const toolTitles: Record<StudioTool, string> = {
  structure: "Structure",
  content: "Content",
  design: "Design",
  interaction: "Interaction",
  narration: "Narration",
  media: "Media",
  animation: "Animation",
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
  onAddBlock,
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
  onAddBlock: (sceneId: string, blockType: string) => void;
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
        {tool === "structure" ? (
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

        {tool === "content" ? (
          <ContentTool 
          scene={scene}
          onCreateScene={onCreateScene} 
          onUpdateScene={onUpdateScene}
          onAddBlock={onAddBlock}
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
          <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
            Design controls coming next: background, colors, typography,
            spacing, cards, and scene theme.
          </div>
        ) : null}

        {tool === "media" ? (
          <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
            Media controls coming next: images, diagrams, icons, video, and
            audio uploads.
          </div>
        ) : null}

        {tool === "animation" ? (
          <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
            Animation controls coming next: reveal timing, fade, slide, graph
            drawing, and block sequencing.
          </div>
        ) : null}

        {tool === "preview" ? (
          <JsonTool draft={draft} storageKey={storageKey} />
        ) : null}
      </div>
    </aside>
  );
}