import type {
  AdminAssessmentDraft,
  AdminLessonDraft,
  AdminPaperDraft,
  AdminSceneDraft,
  AdminSubtopicDraft,
  AdminTopicDraft,
  CreateSceneInput,
} from "@/features/admin/papers/types/paper-workspace.types";

type PublishStatus = "draft" | "published" | "archived";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function uniqueId(prefix: string, title?: string) {
  const slug = title ? slugify(title) : "";
  return `${prefix}-${slug || Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createAssessmentDraft(
  scope: AdminAssessmentDraft["scope"],
  title: string,
): AdminAssessmentDraft {
  const topicQuestions: AdminAssessmentDraft["questions"] = [
    {
      id: uniqueId("question", `${title}-binary`),
      number: 1,
      title: "Binary and hexadecimal representation",
      difficulty: "medium",
      tags: ["binary", "hexadecimal", "number systems"],
      source: {
        paper: "9618/12",
        session: "Specimen",
        questionRef: "Q1",
      },
      context: "A computer stores the binary value 10110110.",
      parts: [
        {
          id: uniqueId("part", "a"),
          label: "(a)",
          prompt:
            "Convert this value into denary. Show your working.",
          marks: 3,
          answerSlots: [
            {
              id: uniqueId("answer", "working"),
              kind: "working",
              label: "Working",
              lines: 4,
              placeholder: "Show selected place values...",
            },
            {
              id: uniqueId("answer", "final"),
              kind: "short",
              label: "Final denary answer",
              lines: 1,
              placeholder: "e.g. 182",
            },
          ],
          markScheme: [
            {
              id: uniqueId("mark-point", "place-values"),
              text: "Identifies the place values 128, 32, 16, 4 and 2.",
              marks: 1,
              keywords: ["128", "32", "16", "4", "2"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
            {
              id: uniqueId("mark-point", "addition"),
              text: "Adds the selected place values correctly.",
              marks: 1,
              keywords: ["128", "32", "16", "4", "2", "182"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
            {
              id: uniqueId("mark-point", "answer"),
              text: "Gives the final denary answer 182.",
              marks: 1,
              keywords: ["182"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
          ],
          expectedAnswer:
            "10110110 = 128 + 32 + 16 + 4 + 2 = 182.",
          subparts: [],
          tags: ["binary conversion"],
          topic: "Data representation",
        },
        {
          id: uniqueId("part", "b"),
          label: "(b)",
          prompt:
            "Select the statements that correctly describe hexadecimal representation.",
          marks: 3,
          answerSlots: [
            {
              id: uniqueId("answer", "hex-statements"),
              kind: "multi_tick",
              label: "Choose all that apply",
              options: [
                "One hexadecimal digit can represent four binary bits.",
                "Hexadecimal is base 8.",
                "A-F represent values ten to fifteen.",
                "Hexadecimal changes the value being stored.",
              ],
            },
          ],
          markScheme: [
            {
              id: uniqueId("mark-point", "four-bits"),
              text: "Recognises that one hexadecimal digit represents four binary bits.",
              marks: 1,
              keywords: ["four binary bits", "4 bits"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
            {
              id: uniqueId("mark-point", "base-16"),
              text: "Recognises hexadecimal as base 16 with A-F representing 10-15.",
              marks: 1,
              keywords: ["base 16", "A-F", "ten", "fifteen"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
            {
              id: uniqueId("mark-point", "representation"),
              text: "Understands that hexadecimal is a representation of the same stored value.",
              marks: 1,
              keywords: ["representation", "same value"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
          ],
          expectedAnswer:
            "Correct statements: one hexadecimal digit can represent four binary bits; A-F represent values ten to fifteen.",
          subparts: [],
          tags: ["hexadecimal"],
          topic: "Data representation",
        },
      ],
    },
    {
      id: uniqueId("question", `${title}-conversion-table`),
      number: 2,
      title: "Number base conversion table",
      difficulty: "medium",
      tags: ["binary", "denary", "hexadecimal"],
      source: {
        paper: "9618/12",
        session: "Specimen",
        questionRef: "Q2",
      },
      context: "",
      parts: [
        {
          id: uniqueId("part", "table"),
          label: "(a)",
          prompt:
            "Complete the table by converting each representation into the missing form.",
          marks: 6,
          answerSlots: [
            {
              id: uniqueId("answer", "conversion-table"),
              kind: "table",
              label: "Conversion table",
              columns: ["Binary", "Denary", "Hexadecimal"],
              rows: 3,
              options: ["10101010", "199", "7F"],
            },
          ],
          markScheme: [
            {
              id: uniqueId("mark-point", "row-one"),
              text: "Correctly converts 10101010 into denary and hexadecimal.",
              marks: 2,
              keywords: ["170", "AA"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
            {
              id: uniqueId("mark-point", "row-two"),
              text: "Correctly converts 199 into binary and hexadecimal.",
              marks: 2,
              keywords: ["11000111", "C7"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
            {
              id: uniqueId("mark-point", "row-three"),
              text: "Correctly converts 7F into binary and denary.",
              marks: 2,
              keywords: ["01111111", "127"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
          ],
          expectedAnswer:
            "10101010 = 170 = AA; 199 = 11000111 = C7; 7F = 01111111 = 127.",
          subparts: [],
          tags: ["conversion"],
          topic: "Data representation",
        },
      ],
    },
  ];
  const moduleOnlyQuestions: AdminAssessmentDraft["questions"] = [
    {
      id: uniqueId("question", `${title}-colour-depth`),
      number: 3,
      title: "Bitmap colour depth",
      difficulty: "medium",
      tags: ["bitmap", "colour depth", "file size"],
      source: {
        paper: "9618/12",
        session: "Specimen",
        questionRef: "Q3",
      },
      context: "",
      parts: [
        {
          id: uniqueId("part", "colour-depth"),
          label: "(a)",
          prompt:
            "A bitmap image is stored using 24-bit colour depth. Explain how colour depth affects file size and image quality.",
          marks: 6,
          answerSlots: [
            {
              id: uniqueId("answer", "colour-depth"),
              kind: "long",
              label: "Answer",
              lines: 7,
              placeholder: "Write a structured explanation...",
            },
          ],
          markScheme: [
            {
              id: uniqueId("mark-point", "bits-per-pixel"),
              text: "Explains that colour depth is the number of bits used per pixel.",
              marks: 2,
              keywords: ["bits", "pixel"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
            {
              id: uniqueId("mark-point", "file-size"),
              text: "Links higher colour depth to increased file size.",
              marks: 2,
              keywords: ["higher", "file size", "storage"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
            {
              id: uniqueId("mark-point", "quality"),
              text: "Links higher colour depth to more possible colours and smoother image quality.",
              marks: 2,
              keywords: ["more colours", "quality", "smoother"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
          ],
          expectedAnswer:
            "Colour depth is the number of bits stored for each pixel. Increasing colour depth increases the number of possible colours, which can improve image quality, but it also increases the number of bits stored and therefore the file size.",
          subparts: [],
          tags: ["images"],
          topic: "Data representation",
        },
      ],
    },
    {
      id: uniqueId("question", `${title}-pseudocode`),
      number: 4,
      title: "Counting bits algorithm",
      difficulty: "hard",
      tags: ["pseudocode", "iteration", "counting"],
      source: {
        paper: "9618/22",
        session: "Specimen",
        questionRef: "Q4",
      },
      context: "",
      parts: [
        {
          id: uniqueId("part", "pseudocode"),
          label: "(a)",
          prompt:
            "Write pseudocode that counts how many binary digits in an 8-bit string are equal to 1.",
          marks: 8,
          answerSlots: [
            {
              id: uniqueId("answer", "pseudocode"),
              kind: "code",
              label: "Pseudocode",
              lines: 9,
              placeholder: "Write your algorithm...",
            },
          ],
          markScheme: [
            {
              id: uniqueId("mark-point", "initialise"),
              text: "Initialises a counter before iteration.",
              marks: 2,
              keywords: ["count", "0"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
            {
              id: uniqueId("mark-point", "loop"),
              text: "Loops through each of the 8 binary digits.",
              marks: 2,
              keywords: ["for", "while", "8"],
              acceptedAlternatives: ["loop"],
              requiresEvidence: true,
            },
            {
              id: uniqueId("mark-point", "condition"),
              text: "Tests whether the current digit is equal to 1.",
              marks: 2,
              keywords: ["if", "1"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
            {
              id: uniqueId("mark-point", "output"),
              text: "Outputs or returns the final count.",
              marks: 2,
              keywords: ["output", "return", "count"],
              acceptedAlternatives: [],
              requiresEvidence: true,
            },
          ],
          expectedAnswer:
            "count <- 0\nFOR i <- 1 TO 8\n  IF bitString[i] = '1' THEN\n    count <- count + 1\n  ENDIF\nNEXT i\nOUTPUT count",
          subparts: [],
          tags: ["algorithm design"],
          topic: "Programming",
        },
      ],
    },
  ];

  return {
    id: uniqueId(`${scope}-assessment`, title),
    title,
    scope,
    description:
      scope === "module"
        ? "Full-paper assessment draft with exam-style questions."
        : "Topic checkpoint draft with exam-style questions.",
    durationMinutes: scope === "module" ? 60 : 20,
    unlock: {
      markScheme: "after_submit",
      expectedAnswer: "after_submit",
    },
    questions:
      scope === "module"
        ? [...topicQuestions, ...moduleOnlyQuestions]
        : topicQuestions,
  };
}

export function normalizeAssessmentDraft(
  assessment: AdminAssessmentDraft | undefined,
  scope: AdminAssessmentDraft["scope"],
  title: string,
): AdminAssessmentDraft {
  const starter = assessment ?? createAssessmentDraft(scope, title);

  return {
    ...starter,
    title: starter.title || title,
    scope,
    durationMinutes: starter.durationMinutes ?? (scope === "module" ? 60 : 20),
    unlock: {
      markScheme: starter.unlock?.markScheme ?? "after_submit",
      expectedAnswer: starter.unlock?.expectedAnswer ?? "after_submit",
    },
    questions: (starter.questions ?? []).map((question, questionIndex) => ({
      ...question,
      number: question.number ?? questionIndex + 1,
      title:
        question.title && !/^Question \d+$/i.test(question.title)
          ? question.title
          : "Searching a sorted list",
      tags: question.tags ?? [],
      parts: (question.parts ?? []).map(normalizeAssessmentPartDraft),
    })),
  };
}

function normalizeAssessmentPartDraft(
  part: AdminAssessmentDraft["questions"][number]["parts"][number],
): AdminAssessmentDraft["questions"][number]["parts"][number] {
  return {
    ...part,
    marks: part.marks ?? 1,
    answerSlots: (part.answerSlots ?? []).map((slot) => ({
      ...slot,
      label:
        slot.label ??
        (slot.kind === "code"
          ? "Pseudocode answer"
          : slot.kind === "table"
            ? "Complete the table"
            : "Candidate answer"),
      kind: slot.kind ?? "long",
      lines: slot.lines ?? (slot.kind === "short" ? 1 : 4),
    })),
    markScheme: (part.markScheme ?? []).map((markPoint) => ({
      ...markPoint,
      marks: markPoint.marks ?? 1,
      keywords: markPoint.keywords ?? [],
      acceptedAlternatives: markPoint.acceptedAlternatives ?? [],
      requiresEvidence: markPoint.requiresEvidence ?? true,
    })),
    subparts: (part.subparts ?? []).map(normalizeAssessmentPartDraft),
    tags: part.tags ?? [],
  };
}

function withUpdatedAt(draft: AdminPaperDraft): AdminPaperDraft {
  return {
    ...draft,
    updatedAt: new Date().toISOString(),
  };
}

function reorder<T>(items: T[], index: number, direction: "up" | "down") {
  const next = [...items];
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= next.length) return next;

  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

function orderScenes(scenes: AdminSceneDraft[]) {
  return scenes.map((scene, index) => ({ ...scene, order: index + 1 }));
}

function sceneDurationMinutes(scene: AdminSceneDraft) {
  if (typeof scene.durationMinutes === "number") {
    return Math.max(0, scene.durationMinutes);
  }

  const maxSeconds = (scene.blocks ?? []).reduce(
    (max, block) => Math.max(max, (block.startTime ?? 0) + (block.duration ?? 0)),
    0,
  );

  return maxSeconds ? Math.ceil(maxSeconds / 60) : 1;
}

export function getLessonDurationMinutes(lesson: AdminLessonDraft) {
  return lesson.scenes.reduce(
    (total, scene) => total + sceneDurationMinutes(scene),
    0,
  );
}

export function getPaperDurationMinutes(draft: AdminPaperDraft) {
  return draft.topics.reduce(
    (topicTotal, topic) =>
      topicTotal +
      topic.subtopics.reduce(
        (subtopicTotal, subtopic) =>
          subtopicTotal +
          subtopic.lessons.reduce(
            (lessonTotal, lesson) =>
              lessonTotal + getLessonDurationMinutes(lesson),
            0,
          ),
        0,
      ),
    0,
  );
}

export function getPaperReadiness(draft: AdminPaperDraft) {
  const topicCount = draft.topics.length;
  const lessonCount = draft.topics.reduce(
    (total, topic) =>
      total +
      topic.subtopics.reduce(
        (subtopicTotal, subtopic) => subtopicTotal + subtopic.lessons.length,
        0,
      ),
    0,
  );
  const sceneCount = draft.topics.reduce(
    (total, topic) =>
      total +
      topic.subtopics.reduce(
        (subtopicTotal, subtopic) =>
          subtopicTotal +
          subtopic.lessons.reduce(
            (lessonTotal, lesson) => lessonTotal + lesson.scenes.length,
            0,
          ),
        0,
      ),
    0,
  );

  return {
    topicCount,
    lessonCount,
    sceneCount,
    ready: topicCount > 0 && lessonCount > 0 && sceneCount > 0,
  };
}

export function createInitialPaperDraft(
  subjectId: string,
  paperId: string,
): AdminPaperDraft {
  if (subjectId === "9709" && paperId.startsWith("paper-9709-")) {
    return createMathematicsStarterDraft(subjectId, paperId);
  }

  if (subjectId === "9702" && paperId.startsWith("paper-9702-")) {
    return createPhysicsStarterDraft(subjectId, paperId);
  }

  if (subjectId === "9618" && paperId.startsWith("paper-9618-")) {
    return createComputerScienceStarterDraft(subjectId, paperId);
  }

  return createGenericStarterDraft(subjectId, paperId);
}

function createGenericStarterDraft(
  subjectId: string,
  paperId: string,
): AdminPaperDraft {
  return {
    subjectId,
    paperId,
    updatedAt: new Date().toISOString(),
    moduleAssessmentTitle: "Paper assessment",
    topics: [
      {
        id: "introduction-topic",
        title: "Introduction Topic",
        status: "draft",
        topicalAssessmentTitle: "Introduction checkpoint",
        subtopics: [
          {
            id: "getting-started",
            title: "Getting Started",
            status: "draft",
            lessons: [
              {
                id: "welcome-lesson",
                title: "Welcome Lesson",
                status: "draft",
                scenes: [
                  {
                    id: "intro-scene",
                    title: "Intro Scene",
                    type: "concept",
                    summary: "Hook the learner and set the purpose of the lesson.",
                    status: "draft",
                    order: 1,
                    design: {
                      horizontalAlign: "center",
                      verticalAlign: "center",
                    },
                    blocks: [
                      {
                        id: "starter-heading",
                        type: "heading",
                        content: "Welcome to this paper",
                        stepIndex: 1,
                        startTime: 0,
                        duration: 6,
                      },
                      {
                        id: "starter-paragraph",
                        type: "paragraph",
                        content:
                          "Use this opening scene to tell learners what they will understand by the end.",
                        stepIndex: 2,
                        startTime: 6,
                        duration: 8,
                      },
                    ],
                  },
                  {
                    id: "concept-scene",
                    title: "Concept Scene",
                    type: "diagram",
                    summary: "Explain one core idea with a simple visual structure.",
                    status: "draft",
                    order: 2,
                    design: {
                      horizontalAlign: "center",
                      verticalAlign: "center",
                    },
                    blocks: [
                      {
                        id: "concept-list",
                        type: "list",
                        content: [
                          "Define the key idea",
                          "Show the pattern",
                          "Connect it to an exam skill",
                        ],
                        stepIndex: 1,
                        startTime: 0,
                        duration: 10,
                      },
                    ],
                  },
                  {
                    id: "example-scene",
                    title: "Example Scene",
                    type: "example",
                    summary: "Model a worked example before learner practice.",
                    status: "draft",
                    order: 3,
                    design: {
                      horizontalAlign: "center",
                      verticalAlign: "center",
                    },
                    blocks: [
                      {
                        id: "example-key-idea",
                        type: "callout",
                        content:
                          "Worked example: model one step, then ask the learner to predict the next step.",
                        stepIndex: 1,
                        startTime: 0,
                        duration: 10,
                      },
                    ],
                  },
                  {
                    id: "embedded-checkpoint-scene",
                    title: "Embedded Checkpoint Scene",
                    type: "checkpoint",
                    summary: "Ask one quick question before the learner continues.",
                    status: "draft",
                    order: 4,
                    design: {
                      horizontalAlign: "center",
                      verticalAlign: "center",
                    },
                    blocks: [
                      {
                        id: "checkpoint-prompt",
                        type: "checkpoint",
                        content: "What is the most important idea from this lesson?",
                        stepIndex: 1,
                        startTime: 0,
                        duration: 8,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
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
                status: "published",
                scenes: [
                  {
                    id: "scene-binary-concept",
                    title: "What is binary?",
                    type: "concept",
                    summary:
                      "Introduce binary as a base-2 number system used by computers.",
                    status: "draft",
                    order: 1,
                    design: {
                      horizontalAlign: "center",
                      verticalAlign: "center",
                    },
                    blocks: [
                      {
                        id: "binary-paragraph",
                        type: "paragraph",
                        content:
                          "Binary is a base-2 number system. It uses only 0 and 1, which matches the two stable states of digital circuits.",
                        stepIndex: 1,
                        startTime: 0,
                        duration: 8,
                      },
                      {
                        id: "binary-key-idea",
                        type: "callout",
                        content:
                          "Key idea: every binary digit is a bit, and each bit position has a place value.",
                        stepIndex: 2,
                        startTime: 8,
                        duration: 8,
                      },
                      {
                        id: "binary-bullets",
                        type: "list",
                        content: [
                          "Rightmost bit has value 1",
                          "Each move left doubles the place value",
                          "Add the active place values to convert to denary",
                        ],
                        stepIndex: 3,
                        startTime: 16,
                        duration: 10,
                      },
                      {
                        id: "binary-code",
                        type: "code",
                        content:
                          "Denary <- 0\nFOR Position <- 0 TO 7\n    IF Bit[Position] = 1 THEN\n        Denary <- Denary + 2 ^ Position\n    ENDIF\nNEXT Position\nOUTPUT Denary",
                        stepIndex: 4,
                        startTime: 26,
                        duration: 12,
                      },
                    ],
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
                    blocks: [
                      {
                        id: "binary-checkpoint-prompt",
                        type: "checkpoint",
                        content:
                          "Which place values are added to make denary 178?",
                        stepIndex: 1,
                        startTime: 0,
                        duration: 8,
                      },
                    ],
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
                    design: {
                      horizontalAlign: "center",
                      verticalAlign: "center",
                    },
                    blocks: [
                      {
                        id: "square-paragraph",
                        type: "paragraph",
                        content:
                          "Completing the square rewrites a quadratic so its turning point is easier to see.",
                        stepIndex: 1,
                        startTime: 0,
                        duration: 8,
                      },
                      {
                        id: "square-numbered",
                        type: "numbered-list",
                        content: [
                          "Halve the coefficient of x",
                          "Square that number",
                          "Add and subtract it to keep the expression equal",
                        ],
                        stepIndex: 2,
                        startTime: 8,
                        duration: 12,
                      },
                      {
                        id: "square-key-idea",
                        type: "callout",
                        content:
                          "Key idea: the square form shows the shift from y = x^2.",
                        stepIndex: 3,
                        startTime: 20,
                        duration: 8,
                      },
                    ],
                  },
                  {
                    id: "scene-square-example",
                    title: "Rewrite x^2 + 6x + 5",
                    type: "concept",
                    summary:
                      "Step through x^2 + 6x + 5 = (x + 3)^2 - 4.",
                    status: "draft",
                    order: 2,
                    blocks: [
                      {
                        id: "square-example-steps",
                        type: "code",
                        content:
                          "x^2 + 6x + 5\n= (x + 3)^2 - 9 + 5\n= (x + 3)^2 - 4",
                        stepIndex: 1,
                        startTime: 0,
                        duration: 10,
                      },
                      {
                        id: "square-quote",
                        type: "quote",
                        content:
                          "The number inside the bracket gives the horizontal shift; the number outside gives the vertical shift.",
                        stepIndex: 2,
                        startTime: 10,
                        duration: 8,
                      },
                    ],
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
                    design: {
                      horizontalAlign: "center",
                      verticalAlign: "center",
                    },
                    blocks: [
                      {
                        id: "gradient-paragraph",
                        type: "paragraph",
                        content:
                          "On a displacement-time graph, the gradient tells us the velocity of the object.",
                        stepIndex: 1,
                        startTime: 0,
                        duration: 8,
                      },
                      {
                        id: "gradient-key-idea",
                        type: "callout",
                        content:
                          "Key idea: steeper gradient means greater speed.",
                        stepIndex: 2,
                        startTime: 8,
                        duration: 8,
                      },
                      {
                        id: "gradient-numbered",
                        type: "numbered-list",
                        content: [
                          "Choose two points on the line",
                          "Find change in displacement",
                          "Find change in time",
                          "Divide displacement change by time change",
                        ],
                        stepIndex: 3,
                        startTime: 16,
                        duration: 12,
                      },
                      {
                        id: "gradient-formula-code",
                        type: "code",
                        content:
                          "velocity = change in displacement / change in time\nv = Delta s / Delta t",
                        stepIndex: 4,
                        startTime: 28,
                        duration: 8,
                      },
                    ],
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
    moduleAssessment: normalizeAssessmentDraft(
      draft.moduleAssessment,
      "module",
      draft.moduleAssessmentTitle ?? "Paper 1 module assessment",
    ),
    subjectMeta: draft.subjectMeta
      ? {
          ...draft.subjectMeta,
          learningOutcomes: draft.subjectMeta.learningOutcomes ?? [],
          skills: draft.subjectMeta.skills ?? [],
          status: draft.subjectMeta.status ?? "draft",
        }
      : undefined,
    paperMeta: draft.paperMeta
      ? {
          ...draft.paperMeta,
          learningOutcomes: draft.paperMeta.learningOutcomes ?? [],
          skills: draft.paperMeta.skills ?? [],
          estimatedMinutes:
            draft.paperMeta.estimatedMinutes ?? getPaperDurationMinutes(draft),
          status: draft.paperMeta.status ?? "draft",
        }
      : undefined,
    ui: {
      expandedTopicIds:
        draft.ui?.expandedTopicIds ??
        (draft.topics[0]?.id ? [draft.topics[0].id] : []),
      activeLessonId: draft.ui?.activeLessonId,
      activeSceneId: draft.ui?.activeSceneId,
      selectedTopicId: draft.ui?.selectedTopicId,
    },
    topics: draft.topics.map((topic) => {
      const legacyTopic = topic as AdminTopicDraft & {
        lessons?: AdminLessonDraft[];
      };

      if (legacyTopic.subtopics) {
        const topicalAssessmentTitle =
          legacyTopic.topicalAssessmentTitle ?? `${legacyTopic.title} checkpoint`;

        return {
          ...legacyTopic,
          status: legacyTopic.status ?? "draft",
          topicalAssessmentTitle,
          topicalAssessment: normalizeAssessmentDraft(
            legacyTopic.topicalAssessment,
            "topical",
            topicalAssessmentTitle,
          ),
          subtopics: legacyTopic.subtopics.map((subtopic) => ({
            ...subtopic,
            status: subtopic.status ?? "draft",
            lessons: subtopic.lessons.map((lesson) => ({
              ...lesson,
              status: lesson.status ?? "draft",
              scenes: lesson.scenes.map(normalizeSceneDraft),
            })),
          })),
        };
      }

      return {
        id: legacyTopic.id,
        title: legacyTopic.title,
        status: legacyTopic.status ?? "draft",
        topicalAssessmentTitle:
          legacyTopic.topicalAssessmentTitle ?? `${legacyTopic.title} checkpoint`,
        topicalAssessment: normalizeAssessmentDraft(
          legacyTopic.topicalAssessment,
          "topical",
          legacyTopic.topicalAssessmentTitle ?? `${legacyTopic.title} checkpoint`,
        ),
        subtopics: [
          {
            id: `${legacyTopic.id}-subtopic`,
            title: "Introduction",
            status: "draft",
            lessons: (legacyTopic.lessons ?? []).map((lesson) => ({
              ...lesson,
              status: lesson.status ?? "draft",
              scenes: lesson.scenes.map(normalizeSceneDraft),
            })),
          },
        ],
      };
    }),
  };
}

function normalizeSceneDraft(scene: AdminSceneDraft): AdminSceneDraft {
  const normalizedScene = {
    ...scene,
    status: scene.status ?? "draft",
    durationMinutes: scene.durationMinutes ?? sceneDurationMinutes(scene),
    assessment:
      scene.type === "checkpoint" || scene.assessment
        ? normalizeAssessmentDraft(
            scene.assessment,
            "embedded",
            scene.title || "Embedded checkpoint",
          )
        : scene.assessment,
  };

  if (!scene.voiceover) return normalizedScene;

  return {
    ...normalizedScene,
    voiceover: {
      mode:
        scene.voiceover.mode ??
        (scene.voiceover.audioUrl ? "uploaded" : "generated"),
      script: scene.voiceover.script ?? "",
      speed: scene.voiceover.speed ?? 1,
      provider: scene.voiceover.provider ?? "browser",
      voiceId: scene.voiceover.voiceId ?? "browser-default",
      captionsEnabled: scene.voiceover.captionsEnabled ?? true,
      processingStatus: scene.voiceover.processingStatus ?? "idle",
      audioUrl: scene.voiceover.audioUrl,
      durationSeconds: scene.voiceover.durationSeconds,
      originalAudioUrl: scene.voiceover.originalAudioUrl,
      cleanedAudioUrl: scene.voiceover.cleanedAudioUrl,
      captions: scene.voiceover.captions,
    },
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
    id: uniqueId("scene", input.title),
    title: input.title || `Scene ${nextOrder}`,
    type: input.type,
    summary: input.summary || "Draft scene summary.",
    status: "draft" as const,
    order: nextOrder,
    durationMinutes: input.durationMinutes ?? 3,
    design: {
      horizontalAlign: "center" as const,
      verticalAlign: "center" as const,
    },
    assessment:
      input.type === "checkpoint"
        ? createAssessmentDraft("embedded", input.title || `Scene ${nextOrder}`)
        : undefined,
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

export function addTopic(draft: AdminPaperDraft, title: string): AdminPaperDraft {
  const topic: AdminTopicDraft = {
    id: uniqueId("topic", title),
    title: title || "Untitled topic",
    status: "draft",
    topicalAssessmentTitle: `${title || "Untitled topic"} checkpoint`,
    topicalAssessment: createAssessmentDraft(
      "topical",
      `${title || "Untitled topic"} checkpoint`,
    ),
    subtopics: [],
  };

  return withUpdatedAt({
    ...draft,
    ui: {
      ...draft.ui,
      selectedTopicId: topic.id,
      expandedTopicIds: [...(draft.ui?.expandedTopicIds ?? []), topic.id],
    },
    topics: [...draft.topics, topic],
  });
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

export function updateTopicStatus(
  draft: AdminPaperDraft,
  topicId: string,
  status: PublishStatus,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) =>
      topic.id === topicId ? { ...topic, status } : topic,
    ),
  });
}

export function deleteTopic(draft: AdminPaperDraft, topicId: string): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.filter((topic) => topic.id !== topicId),
  });
}

export function moveTopic(
  draft: AdminPaperDraft,
  topicId: string,
  direction: "up" | "down",
): AdminPaperDraft {
  const index = draft.topics.findIndex((topic) => topic.id === topicId);
  return withUpdatedAt({
    ...draft,
    topics: index === -1 ? draft.topics : reorder(draft.topics, index, direction),
  });
}

export function addSubtopic(
  draft: AdminPaperDraft,
  topicId: string,
  title: string,
): AdminPaperDraft {
  const subtopic: AdminSubtopicDraft = {
    id: uniqueId("subtopic", title),
    title: title || "Untitled subtopic",
    status: "draft",
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

export function renameSubtopic(
  draft: AdminPaperDraft,
  subtopicId: string,
  title: string,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((subtopic) =>
        subtopic.id === subtopicId
          ? { ...subtopic, title: title || subtopic.title }
          : subtopic,
      ),
    })),
  });
}

export function deleteSubtopic(
  draft: AdminPaperDraft,
  topicId: string,
  subtopicId: string,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            subtopics: topic.subtopics.filter(
              (subtopic) => subtopic.id !== subtopicId,
            ),
          }
        : topic,
    ),
  });
}

export function moveSubtopic(
  draft: AdminPaperDraft,
  topicId: string,
  subtopicId: string,
  direction: "up" | "down",
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) => {
      if (topic.id !== topicId) return topic;
      const index = topic.subtopics.findIndex(
        (subtopic) => subtopic.id === subtopicId,
      );

      return {
        ...topic,
        subtopics:
          index === -1
            ? topic.subtopics
            : reorder(topic.subtopics, index, direction),
      };
    }),
  });
}

export function addLesson(
  draft: AdminPaperDraft,
  topicId: string,
  subtopicId: string,
  title: string,
): AdminPaperDraft {
  const lesson: AdminLessonDraft = {
    id: uniqueId("lesson", title),
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

export function renameLesson(
  draft: AdminPaperDraft,
  lessonId: string,
  title: string,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((subtopic) => ({
        ...subtopic,
        lessons: subtopic.lessons.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, title: title || lesson.title }
            : lesson,
        ),
      })),
    })),
  });
}

export function updateLessonStatus(
  draft: AdminPaperDraft,
  lessonId: string,
  status: PublishStatus,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((subtopic) => ({
        ...subtopic,
        lessons: subtopic.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, status } : lesson,
        ),
      })),
    })),
  });
}

export function deleteLesson(
  draft: AdminPaperDraft,
  subtopicId: string,
  lessonId: string,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((subtopic) =>
        subtopic.id === subtopicId
          ? {
              ...subtopic,
              lessons: subtopic.lessons.filter(
                (lesson) => lesson.id !== lessonId,
              ),
            }
          : subtopic,
      ),
    })),
  });
}

export function moveLesson(
  draft: AdminPaperDraft,
  subtopicId: string,
  lessonId: string,
  direction: "up" | "down",
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((subtopic) => {
        if (subtopic.id !== subtopicId) return subtopic;
        const index = subtopic.lessons.findIndex(
          (lesson) => lesson.id === lessonId,
        );

        return {
          ...subtopic,
          lessons:
            index === -1
              ? subtopic.lessons
              : reorder(subtopic.lessons, index, direction),
        };
      }),
    })),
  });
}

export function addSceneToLesson(
  draft: AdminPaperDraft,
  lessonId: string,
  input: CreateSceneInput,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((subtopic) => ({
        ...subtopic,
        lessons: subtopic.lessons.map((lesson) => {
          if (lesson.id !== lessonId) return lesson;
          const nextOrder = lesson.scenes.length + 1;
          const scene: AdminSceneDraft = {
            id: uniqueId("scene", input.title),
            title: input.title || `Scene ${nextOrder}`,
            type: input.type,
            summary: input.summary || "Draft scene summary.",
            status: "draft",
            order: nextOrder,
            durationMinutes: input.durationMinutes ?? 3,
            design: {
              horizontalAlign: "center",
              verticalAlign: "center",
            },
            assessment:
              input.type === "checkpoint"
                ? createAssessmentDraft(
                    "embedded",
                    input.title || `Scene ${nextOrder}`,
                  )
                : undefined,
          };

          return {
            ...lesson,
            scenes: [...lesson.scenes, scene],
          };
        }),
      })),
    })),
  });
}

export function updateScene(
  draft: AdminPaperDraft,
  sceneId: string,
  updates: Partial<AdminSceneDraft>,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) => ({
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
  });
}

export function deleteScene(draft: AdminPaperDraft, sceneId: string): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((subtopic) => ({
        ...subtopic,
        lessons: subtopic.lessons.map((lesson) => ({
          ...lesson,
          scenes: orderScenes(
            lesson.scenes.filter((scene) => scene.id !== sceneId),
          ),
        })),
      })),
    })),
  });
}

export function moveScene(
  draft: AdminPaperDraft,
  lessonId: string,
  sceneId: string,
  direction: "up" | "down",
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((subtopic) => ({
        ...subtopic,
        lessons: subtopic.lessons.map((lesson) => {
          if (lesson.id !== lessonId) return lesson;
          const index = lesson.scenes.findIndex((scene) => scene.id === sceneId);

          return {
            ...lesson,
            scenes:
              index === -1
                ? lesson.scenes
                : orderScenes(reorder(lesson.scenes, index, direction)),
          };
        }),
      })),
    })),
  });
}

export function updateSubjectMeta(
  draft: AdminPaperDraft,
  subjectMeta: NonNullable<AdminPaperDraft["subjectMeta"]>,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    subjectMeta,
  });
}

export function updatePaperMeta(
  draft: AdminPaperDraft,
  paperMeta: NonNullable<AdminPaperDraft["paperMeta"]>,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    paperMeta: {
      ...paperMeta,
      estimatedMinutes: getPaperDurationMinutes(draft),
    },
  });
}

export function updateWorkspaceUi(
  draft: AdminPaperDraft,
  ui: NonNullable<AdminPaperDraft["ui"]>,
): AdminPaperDraft {
  return {
    ...draft,
    ui: {
      ...draft.ui,
      ...ui,
    },
  };
}

export function renameTopicalAssessment(
  draft: AdminPaperDraft,
  topicId: string,
  title: string,
): AdminPaperDraft {
  const nextTitle = title.trim();

  return {
    ...draft,
    updatedAt: new Date().toISOString(),
    topics: draft.topics.map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            topicalAssessmentTitle: nextTitle || topic.topicalAssessmentTitle,
            topicalAssessment: topic.topicalAssessment
              ? {
                  ...topic.topicalAssessment,
                  title: nextTitle || topic.topicalAssessment.title,
                }
              : topic.topicalAssessment,
          }
        : topic,
    ),
  };
}

export function renameModuleAssessment(
  draft: AdminPaperDraft,
  title: string,
): AdminPaperDraft {
  const nextTitle = title.trim();

  return {
    ...draft,
    updatedAt: new Date().toISOString(),
    moduleAssessmentTitle: nextTitle || draft.moduleAssessmentTitle,
    moduleAssessment: draft.moduleAssessment
      ? {
          ...draft.moduleAssessment,
          title: nextTitle || draft.moduleAssessment.title,
        }
      : draft.moduleAssessment,
  };
}

export function updateTopicalAssessment(
  draft: AdminPaperDraft,
  topicId: string,
  assessment: AdminAssessmentDraft,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    topics: draft.topics.map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            topicalAssessmentTitle: assessment.title || topic.topicalAssessmentTitle,
            topicalAssessment: normalizeAssessmentDraft(
              assessment,
              "topical",
              assessment.title || topic.topicalAssessmentTitle,
            ),
          }
        : topic,
    ),
  });
}

export function updateModuleAssessment(
  draft: AdminPaperDraft,
  assessment: AdminAssessmentDraft,
): AdminPaperDraft {
  return withUpdatedAt({
    ...draft,
    moduleAssessmentTitle: assessment.title || draft.moduleAssessmentTitle,
    moduleAssessment: normalizeAssessmentDraft(
      assessment,
      "module",
      assessment.title || draft.moduleAssessmentTitle,
    ),
  });
}
