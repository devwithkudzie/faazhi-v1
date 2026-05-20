import type { CreatePaperInput, UpdatePaperInput } from "@faazhi/shared";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { lessonComponents, lessons, papers, topics } from "../../db/schema.js";
import { slugify } from "../../utils/slug.js";

function uniqueId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export async function listPapers(subjectId: string) {
  return db.select().from(papers).where(eq(papers.subjectId, subjectId)).orderBy(papers.position, papers.title);
}

export async function listLearnPapers(subjectId: string) {
  const rows = await db.query.papers.findMany({
    where: eq(papers.subjectId, subjectId),
    orderBy: [papers.position, papers.title],
    with: {
      topics: {
        orderBy: [topics.position, topics.title],
        with: {
          lessons: {
            orderBy: [lessons.position, lessons.title],
            with: {
              components: {
                orderBy: [lessonComponents.position],
              },
            },
          },
        },
      },
    },
  });

  function lessonFromComponents(lesson: (typeof rows)[number]["topics"][number]["lessons"][number]) {
    const sourceLesson = lesson.components
      .map((component) => component.content)
      .find((content): content is { sourceLesson: Record<string, unknown> } => {
        return (
          !!content &&
          typeof content === "object" &&
          "sourceLesson" in content &&
          !!(content as { sourceLesson?: unknown }).sourceLesson &&
          typeof (content as { sourceLesson?: unknown }).sourceLesson === "object"
        );
      })?.sourceLesson;

    if (sourceLesson) {
      return {
        ...sourceLesson,
        id: lesson.id,
        title: typeof sourceLesson.title === "string" ? sourceLesson.title : lesson.title,
        description:
          typeof sourceLesson.description === "string" ? sourceLesson.description : lesson.description,
      };
    }

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      notes: "",
      starterCode: "",
      questionPrompt: "",
      marks: 0,
      examples: [],
    };
  }

  return rows.map((paper) => ({
    id: paper.id,
    title: paper.title,
    description: paper.description,
    syllabusFocus: paper.title,
    topics: paper.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      lessons: topic.lessons.map(lessonFromComponents),
    })),
  }));
}

function normalizePaperId(subjectId: string, paperId: string) {
  if (paperId.startsWith(`${subjectId}-`)) {
    return paperId;
  }

  return `${subjectId}-${paperId}`;
}

function getString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

export async function getLearnPaper(subjectId: string, paperId: string) {
  const id = normalizePaperId(subjectId, paperId);
  const paper = await db.query.papers.findFirst({
    where: eq(papers.id, id),
    with: {
      topics: {
        orderBy: [topics.position, topics.title],
        with: {
          lessons: {
            orderBy: [lessons.position, lessons.title],
            with: {
              components: {
                orderBy: [lessonComponents.position],
              },
            },
          },
        },
      },
    },
  });

  if (!paper || paper.subjectId !== subjectId) {
    return null;
  }

  return {
    id: paper.id,
    subjectId: paper.subjectId,
    paperId,
    title: paper.title,
    description: paper.description,
    topics: paper.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      position: topic.position,
      lessons: topic.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        position: lesson.position,
        components: lesson.components.map((component) => {
          const content = component.content as Record<string, unknown>;

          return {
            id: component.id,
            type: component.type,
            title: getString(content.title, component.type.replace("_", " ")),
            duration: getNumber(content.duration),
            position: component.position,
            content,
          };
        }),
      })),
    })),
  };
}

export async function createPaper(subjectId: string, input: CreatePaperInput) {
  return db.transaction(async (tx) => {
    const [paper] = await tx
      .insert(papers)
      .values({
        id: uniqueId("paper"),
        subjectId,
        title: input.title,
        description: input.description ?? "",
      })
      .returning();

    const [topic] = await tx
      .insert(topics)
      .values({
        id: uniqueId("topic"),
        paperId: paper.id,
        title: "Starter Topic 1",
      })
      .returning();

    const [lesson] = await tx
      .insert(lessons)
      .values({
        id: uniqueId("lesson"),
        topicId: topic.id,
        title: "Starter Lesson",
        slug: slugify("Starter Lesson"),
        description: "A starter lesson created with the paper.",
      })
      .returning();

    await tx.insert(lessonComponents).values([
      {
        lessonId: lesson.id,
        id: uniqueId("component"),
        type: "concept",
        position: 0,
        content: { title: "Concept", body: "Add the first explanation here." },
      },
      {
        lessonId: lesson.id,
        id: uniqueId("component"),
        type: "example",
        position: 1,
        content: { title: "Example", body: "Add a worked example here." },
      },
      {
        lessonId: lesson.id,
        id: uniqueId("component"),
        type: "try_it",
        position: 2,
        content: { title: "Try it", prompt: "Add a learner task here." },
      },
    ]);

    return {
      id: paper.id,
      title: paper.title,
      description: paper.description,
      syllabusFocus: paper.title,
      topics: [
        {
          id: topic.id,
          title: topic.title,
          lessons: [
            {
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              notes: "",
              starterCode: "",
              questionPrompt: "",
              marks: 0,
              examples: [],
            },
          ],
        },
      ],
    };
  });
}

export async function updatePaper(id: string, input: UpdatePaperInput) {
  const [paper] = await db
    .update(papers)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(papers.id, id))
    .returning();

  return paper ?? null;
}

export async function deletePaper(id: string) {
  const [paper] = await db.delete(papers).where(eq(papers.id, id)).returning({ id: papers.id });
  return paper ?? null;
}
