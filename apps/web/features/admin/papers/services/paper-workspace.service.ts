import type {
  AdminLessonDraft,
  AdminPaperDraft,
  AdminSubtopicDraft,
  AdminTopicDraft,
  CreateSceneInput,
} from "@/features/admin/papers/types/paper-workspace.types";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function createInitialPaperDraft(
  subjectId: string,
  paperId: string,
): AdminPaperDraft {
  if (subjectId === "9709") {
    return createMathematicsStarterDraft(subjectId, paperId);
  }

  if (subjectId === "9702") {
    return createPhysicsStarterDraft(subjectId, paperId);
  }

  return createComputerScienceStarterDraft(subjectId, paperId);
}

function createComputerScienceStarterDraft(
  subjectId: string,
  paperId: string,
): AdminPaperDraft {
  return {
    subjectId,
    paperId,
    updatedAt: new Date().toISOString(),
    moduleAssessmentTitle: "Paper 1 module assessment",
    topics: [
      {
        id: "information-representation",
        title: "Information Representation",
        topicalAssessmentTitle: "Information Representation assessment",
        subtopics: [
          {
            id: "number-systems",
            title: "Number systems",
            lessons: [
              {
                id: "binary-number-systems",
                title: "Binary number systems",
                status: "draft",
                scenes: [
                  {
                    id: "scene-binary-concept",
                    title: "What is binary?",
                    type: "concept",
                    summary:
                      "Introduce binary as a base-2 number system used by computers.",
                    status: "draft",
                    order: 1,
                  },
                  {
                    id: "scene-binary-place-value",
                    title: "Place values in binary",
                    type: "diagram",
                    summary:
                      "Show the 128, 64, 32, 16, 8, 4, 2, 1 place-value table.",
                    status: "draft",
                    order: 2,
                  },
                  {
                    id: "scene-binary-checkpoint",
                    title: "Try converting 178",
                    type: "checkpoint",
                    summary:
                      "Ask the student to select the binary place values that make 178.",
                    status: "draft",
                    order: 3,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "communication-networking",
        title: "Communication and Networking",
        topicalAssessmentTitle: "Communication and Networking assessment",
        subtopics: [],
      },
    ],
  };
}

function createMathematicsStarterDraft(
  subjectId: string,
  paperId: string,
): AdminPaperDraft {
  return {
    subjectId,
    paperId,
    updatedAt: new Date().toISOString(),
    moduleAssessmentTitle: "Paper 1 module assessment",
    topics: [
      {
        id: "quadratics",
        title: "Quadratics",
        topicalAssessmentTitle: "Quadratics topical assessment",
        subtopics: [
          {
            id: "solving-quadratics",
            title: "Solving quadratics",
            lessons: [
              {
                id: "completing-the-square",
                title: "Completing the square",
                status: "draft",
                scenes: [
                  {
                    id: "scene-square-form",
                    title: "Why complete the square?",
                    type: "concept",
                    summary:
                      "Connect quadratic expressions to a transformed square form.",
                    status: "draft",
                    order: 1,
                  },
                  {
                    id: "scene-square-example",
                    title: "Rewrite x^2 + 6x + 5",
                    type: "example",
                    summary:
                      "Step through x^2 + 6x + 5 = (x + 3)^2 - 4.",
                    status: "draft",
                    order: 2,
                  },
                  {
                    id: "scene-square-checkpoint",
                    title: "Complete one yourself",
                    type: "checkpoint",
                    summary:
                      "Ask the student to complete the square for x^2 + 8x + 7.",
                    status: "draft",
                    order: 3,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "functions",
        title: "Functions",
        topicalAssessmentTitle: "Functions topical assessment",
        subtopics: [
          {
            id: "domain-and-range",
            title: "Domain and range",
            lessons: [],
          },
        ],
      },
    ],
  };
}

function createPhysicsStarterDraft(
  subjectId: string,
  paperId: string,
): AdminPaperDraft {
  return {
    subjectId,
    paperId,
    updatedAt: new Date().toISOString(),
    moduleAssessmentTitle: "Paper 1 module assessment",
    topics: [
      {
        id: "kinematics",
        title: "Kinematics",
        topicalAssessmentTitle: "Kinematics topical assessment",
        subtopics: [
          {
            id: "motion-graphs",
            title: "Motion graphs",
            lessons: [
              {
                id: "displacement-time-graphs",
                title: "Displacement-time graphs",
                status: "draft",
                scenes: [
                  {
                    id: "scene-gradient-meaning",
                    title: "Gradient means velocity",
                    type: "concept",
                    summary:
                      "Explain how the slope of a displacement-time graph represents velocity.",
                    status: "draft",
                    order: 1,
                  },
                  {
                    id: "scene-graph-reading",
                    title: "Read a motion graph",
                    type: "diagram",
                    summary:
                      "Use a graph segment to identify rest, constant velocity, and changing motion.",
                    status: "draft",
                    order: 2,
                  },
                  {
                    id: "scene-graph-exam",
                    title: "Exam-style graph question",
                    type: "exam-extract",
                    summary:
                      "Ask the student to calculate velocity from a graph gradient.",
                    status: "draft",
                    order: 3,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "forces",
        title: "Forces",
        topicalAssessmentTitle: "Forces topical assessment",
        subtopics: [
          {
            id: "newtons-laws",
            title: "Newton's laws",
            lessons: [],
          },
        ],
      },
    ],
  };
}

export function normalizePaperDraft(draft: AdminPaperDraft): AdminPaperDraft {
  return {
    ...draft,
    moduleAssessmentTitle: draft.moduleAssessmentTitle ?? "Paper 1 module assessment",
    topics: draft.topics.map((topic) => {
      const legacyTopic = topic as AdminTopicDraft & {
        lessons?: AdminLessonDraft[];
      };

      if (legacyTopic.subtopics) {
        return legacyTopic;
      }

      return {
        id: legacyTopic.id,
        title: legacyTopic.title,
        topicalAssessmentTitle: legacyTopic.topicalAssessmentTitle,
        subtopics: [
          {
            id: `${legacyTopic.id}-subtopic`,
            title: "Introduction",
            lessons: legacyTopic.lessons ?? [],
          },
        ],
      };
    }),
  };
}

export function addSceneToFirstLesson(
  draft: AdminPaperDraft,
  input: CreateSceneInput,
): AdminPaperDraft {
  const [firstTopic, ...otherTopics] = draft.topics;
  const [firstSubtopic, ...otherSubtopics] = firstTopic.subtopics;
  const [firstLesson, ...otherLessons] = firstSubtopic.lessons;
  const nextOrder = firstLesson.scenes.length + 1;
  const scene = {
    id: `scene-${Date.now()}`,
    title: input.title || `Scene ${nextOrder}`,
    type: input.type,
    summary: input.summary || "Draft scene summary.",
    status: "draft" as const,
    order: nextOrder,
  };

  return {
    ...draft,
    updatedAt: new Date().toISOString(),
    topics: [
      {
        ...firstTopic,
        subtopics: [
          {
            ...firstSubtopic,
            lessons: [
              {
                ...firstLesson,
                scenes: [...firstLesson.scenes, scene],
              },
              ...otherLessons,
            ],
          },
          ...otherSubtopics,
        ],
      },
      ...otherTopics,
    ],
  };
}

export function renameTopic(
  draft: AdminPaperDraft,
  topicId: string,
  title: string,
): AdminPaperDraft {
  return {
    ...draft,
    updatedAt: new Date().toISOString(),
    topics: draft.topics.map((topic) =>
      topic.id === topicId ? { ...topic, title: title || topic.title } : topic,
    ),
  };
}

export function addSubtopic(
  draft: AdminPaperDraft,
  topicId: string,
  title: string,
): AdminPaperDraft {
  const subtopic: AdminSubtopicDraft = {
    id: slugify(title) || `subtopic-${Date.now()}`,
    title: title || "Untitled subtopic",
    lessons: [],
  };

  return {
    ...draft,
    updatedAt: new Date().toISOString(),
    topics: draft.topics.map((topic) =>
      topic.id === topicId
        ? { ...topic, subtopics: [...topic.subtopics, subtopic] }
        : topic,
    ),
  };
}

export function addLesson(
  draft: AdminPaperDraft,
  topicId: string,
  subtopicId: string,
  title: string,
): AdminPaperDraft {
  const lesson: AdminLessonDraft = {
    id: slugify(title) || `lesson-${Date.now()}`,
    title: title || "Untitled lesson",
    status: "draft",
    scenes: [],
  };

  return {
    ...draft,
    updatedAt: new Date().toISOString(),
    topics: draft.topics.map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            subtopics: topic.subtopics.map((subtopic) =>
              subtopic.id === subtopicId
                ? { ...subtopic, lessons: [...subtopic.lessons, lesson] }
                : subtopic,
            ),
          }
        : topic,
    ),
  };
}

export function renameTopicalAssessment(
  draft: AdminPaperDraft,
  topicId: string,
  title: string,
): AdminPaperDraft {
  return {
    ...draft,
    updatedAt: new Date().toISOString(),
    topics: draft.topics.map((topic) =>
      topic.id === topicId
        ? { ...topic, topicalAssessmentTitle: title || topic.topicalAssessmentTitle }
        : topic,
    ),
  };
}

export function renameModuleAssessment(
  draft: AdminPaperDraft,
  title: string,
): AdminPaperDraft {
  return {
    ...draft,
    updatedAt: new Date().toISOString(),
    moduleAssessmentTitle: title || draft.moduleAssessmentTitle,
  };
}
