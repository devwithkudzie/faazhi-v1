import type {
  AdminAssessmentDraft,
  AdminAssessmentPartDraft,
  AdminPaperDraft,
  AdminSceneBlock,
  AdminSceneDraft,
} from "@/features/admin/papers/types/paper-workspace.types";
import type {
  LearnCurriculum,
  PaperQuestion,
  Scene,
  SceneVisualBlock,
} from "@/features/learn/types";

export interface ApiSubject {
  id: string;
  code: string;
  name: string;
  description: string;
  level: "igcse" | "a-level";
  status: "draft" | "published" | "archived";
}

export interface ApiPaper {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: "draft" | "published" | "archived";
  order: number;
}

export interface ApiLesson {
  id: string;
  subjectId: string;
  paperId: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  estimatedMinutes: number;
}

export interface ApiScene {
  id: string;
  lessonId: string;
  title: string;
  type: "concept" | "diagram" | "example" | "checkpoint" | "exam-extract";
  status: "draft" | "published" | "archived";
  order: number;
  durationSeconds: number;
  animation: "none" | "fade" | "slide-up" | "zoom";
  background: string;
}

export interface ApiBlock {
  id: string;
  sceneId: string;
  type: "paragraph" | "list" | "keyIdea" | "quote" | "code";
  content: string;
  items?: string[];
  listKind?: "bullet" | "numbered";
  language?: "pseudocode" | "python" | "javascript" | "plain";
  alignX: "left" | "center" | "right";
  alignY: "top" | "middle" | "bottom";
  stepIndex: number;
  startTime: number;
  duration: number;
  animation: "none" | "fade" | "slide-up" | "zoom";
  order: number;
}

export interface ApiLessonDetail {
  lesson: ApiLesson;
  scenes: ApiScene[];
  blocks: ApiBlock[];
}

function blockText(block: ApiBlock) {
  if (block.items?.length) return block.items.join("\n");
  return block.content;
}

function toVisualBlock(block: ApiBlock): SceneVisualBlock {
  const type =
    block.type === "keyIdea"
      ? "callout"
      : block.type === "list" && block.listKind === "numbered"
        ? "numbered-list"
        : block.type;

  return {
    id: block.id,
    type,
    text: blockText(block),
    items: block.items,
    stepIndex: block.stepIndex,
    startTime: block.startTime,
    duration: block.duration,
  };
}

function toAdminBlock(block: ApiBlock): AdminSceneBlock {
  const type =
    block.type === "keyIdea"
      ? "callout"
      : block.type === "list" && block.listKind === "numbered"
        ? "numbered-list"
        : block.type;

  return {
    id: block.id,
    type,
    content: block.items?.length ? block.items : block.content,
    layout: {
      align: block.alignX,
      width: "md",
    },
    stepIndex: block.stepIndex,
    startTime: block.startTime,
    duration: block.duration,
    animation: block.animation,
  };
}

function fallbackScene(lesson: ApiLesson): Scene {
  return {
    id: `${lesson.id}-empty-scene`,
    type: "concept",
    title: lesson.title,
    eyebrow: "Draft lesson",
    duration: 30,
    narration: lesson.description || "This lesson is ready for scenes.",
    captions: [],
    blocks: [lesson.description || "This lesson is ready for scenes."],
    layout: {
      horizontalAlign: "center",
      verticalAlign: "center",
    },
  };
}

function adminSceneDurationSeconds(scene: AdminSceneDraft) {
  if (typeof scene.durationMinutes === "number") {
    return Math.max(1, scene.durationMinutes) * 60;
  }

  const maxSeconds = (scene.blocks ?? []).reduce(
    (max, block) => Math.max(max, (block.startTime ?? 0) + (block.duration ?? 0)),
    0,
  );

  return maxSeconds || 60;
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

function mapAdminDraftSceneToLearn(scene: AdminSceneDraft): Scene {
  const blocks = scene.blocks ?? [];
  const blockText = (block: AdminSceneBlock) =>
    Array.isArray(block.content) ? block.content.join("\n") : block.content;
  const blockType = (block: AdminSceneBlock): SceneVisualBlock["type"] => {
    if (
      block.type === "paragraph" ||
      block.type === "list" ||
      block.type === "numbered-list" ||
      block.type === "code" ||
      block.type === "callout" ||
      block.type === "quote" ||
      block.type === "heading" ||
      block.type === "caption"
    ) {
      return block.type;
    }

    return "paragraph";
  };
  const narration = blocks.map(blockText).join(" ") || scene.summary || scene.title;
  const paperQuestion = mapAssessmentToPaperQuestion(scene.assessment);

  return {
    id: scene.id,
    type: scene.type as Scene["type"],
    title: scene.title,
    eyebrow: `${scene.type.replace("-", " ")} scene`,
    duration: adminSceneDurationSeconds(scene),
    narration,
    captions:
      scene.voiceover?.captions?.map((caption, index) => ({
        id: `${scene.id}-caption-${index}`,
        ...caption,
      })) ?? [],
    blocks: blocks.map(blockText),
    visualBlocks: blocks.map((block) => ({
      id: block.id,
      type: blockType(block),
      text: blockText(block),
      items: Array.isArray(block.content) ? block.content : undefined,
      stepIndex: block.stepIndex,
      startTime: block.startTime,
      duration: block.duration,
    })),
    code: blocks.find((block) => block.type === "code")?.content as
      | string
      | undefined,
    question:
      scene.type === "checkpoint"
        ? paperQuestion
          ? paperQuestion.prompt
          : blocks[0]
          ? blockText(blocks[0])
          : scene.summary
        : undefined,
    paperQuestion,
    layout: {
      horizontalAlign: scene.design?.horizontalAlign ?? "center",
      verticalAlign: scene.design?.verticalAlign ?? "center",
    },
    voiceover: scene.voiceover,
  };
}

export function buildLearnCurriculumFromAdminDraft(
  draft: AdminPaperDraft,
): LearnCurriculum {
  const topics = draft.topics
    .filter((topic) => (topic.status ?? "draft") === "published")
    .map((topic) => {
      const lessons = topic.subtopics
        .flatMap((subtopic) => subtopic.lessons)
        .filter((lesson) => lesson.status === "published")
        .map((lesson, index) => {
          const scenes = lesson.scenes
            .filter((scene) => scene.status === "published")
            .sort((a, b) => a.order - b.order)
            .map(mapAdminDraftSceneToLearn);

          return {
            id: lesson.id,
            title: lesson.title,
            kind: "lesson" as const,
            durationLabel: `${scenes.reduce(
              (total, scene) => total + Math.ceil(scene.duration / 60),
              0,
            )} min`,
            state: index === 0 ? ("current" as const) : ("available" as const),
            scenes,
          };
        })
        .filter((lesson) => lesson.scenes.length > 0);

      return {
        id: topic.id,
        title: topic.title,
        lessonCount: lessons.length,
        lessons,
        topicalAssessment: {
          id: `${topic.id}-topic-assessment`,
          title: topic.topicalAssessmentTitle,
          durationLabel: `${topic.topicalAssessment?.durationMinutes ?? 20} min`,
          state: "available" as const,
          assessment: topic.topicalAssessment,
        },
      };
    })
    .filter((topic) => topic.lessons.length > 0);

  return {
    subjectId: draft.subjectId,
    subjectTitle: `${draft.subjectMeta?.title ?? "Subject"} ${draft.subjectMeta?.code ?? ""}`.trim(),
    moduleId: draft.paperId,
    moduleTitle: draft.paperMeta?.title ?? "Paper",
    progress: 0,
    topics,
    moduleAssessment: {
      id: `${draft.paperId}-module-assessment`,
      title: draft.moduleAssessmentTitle,
      durationLabel: `${draft.moduleAssessment?.durationMinutes ?? 60} min`,
      state: "available",
      assessment: draft.moduleAssessment,
    },
  };
}

function fallbackAdminScene(lesson: ApiLesson): AdminSceneDraft {
  return {
    id: `${lesson.id}-empty-scene`,
    title: lesson.title,
    type: "concept",
    summary: lesson.description || "This lesson is ready for scenes.",
    status: "draft",
    order: 1,
    design: {
      horizontalAlign: "center",
      verticalAlign: "center",
    },
    blocks: [
      {
        id: `${lesson.id}-empty-block`,
        type: "paragraph",
        content: lesson.description || "Add the first scene block.",
        stepIndex: 1,
        startTime: 0,
        duration: 8,
        animation: "fade",
      },
    ],
  };
}

function mapLearnScene(scene: ApiScene, blocks: ApiBlock[]): Scene {
  const orderedBlocks = blocks
    .filter((block) => block.sceneId === scene.id)
    .sort((a, b) => a.order - b.order);
  const narration = orderedBlocks.map(blockText).join(" ") || scene.title;

  return {
    id: scene.id,
    type: scene.type as Scene["type"],
    title: scene.title,
    eyebrow: `${scene.type.replace("-", " ")} scene`,
    duration: scene.durationSeconds,
    narration,
    captions: [],
    blocks: orderedBlocks.map(blockText),
    visualBlocks: orderedBlocks.map(toVisualBlock),
    code: orderedBlocks.find((block) => block.type === "code")?.content,
    question:
      scene.type === "checkpoint"
        ? orderedBlocks[0]?.content || "Checkpoint question"
        : undefined,
    layout: {
      horizontalAlign: orderedBlocks[0]?.alignX ?? "center",
      verticalAlign:
        orderedBlocks[0]?.alignY === "middle"
          ? "center"
          : orderedBlocks[0]?.alignY ?? "center",
    },
  };
}

function mapAdminScene(scene: ApiScene, blocks: ApiBlock[]): AdminSceneDraft {
  const orderedBlocks = blocks
    .filter((block) => block.sceneId === scene.id)
    .sort((a, b) => a.order - b.order);

  return {
    id: scene.id,
    title: scene.title,
    type: scene.type,
    summary: orderedBlocks[0]?.content ?? scene.title,
    status: scene.status,
    order: scene.order,
    design: {
      backgroundColor: scene.background,
      horizontalAlign: orderedBlocks[0]?.alignX ?? "center",
      verticalAlign:
        orderedBlocks[0]?.alignY === "middle"
          ? "center"
          : orderedBlocks[0]?.alignY ?? "center",
    },
    blocks: orderedBlocks.map(toAdminBlock),
  };
}

export function buildLearnCurriculumFromApi({
  lessonDetails,
  paper,
  subject,
}: {
  lessonDetails: ApiLessonDetail[];
  paper: ApiPaper;
  subject: ApiSubject;
}): LearnCurriculum {
  const lessons = lessonDetails.map((detail, index) => ({
    id: detail.lesson.id,
    title: detail.lesson.title,
    kind: "lesson" as const,
    durationLabel: `${detail.lesson.estimatedMinutes} min`,
    state: index === 0 ? ("current" as const) : ("available" as const),
    scenes: detail.scenes.length
      ? detail.scenes
          .sort((a, b) => a.order - b.order)
          .map((scene) => mapLearnScene(scene, detail.blocks))
      : [fallbackScene(detail.lesson)],
  }));

  return {
    subjectId: subject.id,
    subjectTitle: `${subject.name} ${subject.code}`,
    moduleId: paper.id,
    moduleTitle: paper.title,
    progress: 0,
    topics: [
      {
        id: `${paper.id}-lessons`,
        title: "Paper lessons",
        lessonCount: lessons.length,
        lessons,
        topicalAssessment: {
          id: `${paper.id}-topic-assessment`,
          title: "Paper lessons checkpoint",
          durationLabel: "10 min",
          state: "available",
        },
      },
    ],
    moduleAssessment: {
      id: `${paper.id}-module-assessment`,
      title: `${paper.title} module assessment`,
      durationLabel: "20 min",
      state: "available",
    },
  };
}

export function buildAdminDraftFromApi({
  lessonDetails,
  paper,
  subject,
}: {
  lessonDetails: ApiLessonDetail[];
  paper: ApiPaper;
  subject: ApiSubject;
}): AdminPaperDraft {
  return {
    subjectId: subject.id,
    paperId: paper.id,
    updatedAt: new Date().toISOString(),
    moduleAssessmentTitle: `${paper.title} module assessment`,
    subjectMeta: {
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
    paperMeta: {
      title: paper.title,
      description: paper.description,
      learningOutcomes: [
        `Explain the main concepts in ${paper.title}.`,
        "Apply ideas through worked examples.",
        "Use checkpoints to test understanding.",
      ],
      skills: ["Concept fluency", "Application", "Reflection"],
      estimatedMinutes:
        lessonDetails.reduce(
          (total, detail) =>
            total +
            (detail.scenes.length
              ? detail.scenes.reduce(
                  (sceneTotal, scene) =>
                    sceneTotal + Math.ceil(scene.durationSeconds / 60),
                  0,
                )
              : detail.lesson.estimatedMinutes),
          0,
        ) || 10,
      status: paper.status,
    },
    ui: {
      activeLessonId: lessonDetails[0]?.lesson.id,
      activeSceneId: lessonDetails[0]?.scenes[0]?.id,
      expandedTopicIds: [`${paper.id}-lessons`],
      selectedTopicId: `${paper.id}-lessons`,
    },
    topics: [
      {
        id: `${paper.id}-lessons`,
        title: "Paper lessons",
        status: paper.status,
        topicalAssessmentTitle: "Paper lessons checkpoint",
        subtopics: [
          {
            id: `${paper.id}-getting-started`,
            title: "Getting started",
            status: paper.status,
            lessons: lessonDetails.map((detail) => ({
              id: detail.lesson.id,
              title: detail.lesson.title,
              status: detail.lesson.status,
              scenes: detail.scenes.length
                ? detail.scenes
                    .sort((a, b) => a.order - b.order)
                    .map((scene) => mapAdminScene(scene, detail.blocks))
                : [fallbackAdminScene(detail.lesson)],
            })),
          },
        ],
      },
    ],
  };
}
