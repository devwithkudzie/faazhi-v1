import type { CreateSubjectInput, UpdateSubjectInput } from "@faazhi/shared";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { lessonComponents, lessons, papers, subjects, topics } from "../../db/schema.js";
import { slugify } from "../../utils/slug.js";

function subjectIdFor(input: CreateSubjectInput) {
  return input.code.trim() || slugify(input.name);
}

export async function listSubjects() {
  const rows = await db
    .select({
      id: subjects.id,
      code: subjects.code,
      name: subjects.name,
      description: subjects.description,
      status: subjects.status,
      createdAt: subjects.createdAt,
      updatedAt: subjects.updatedAt,
      paperCount: sql<number>`cast(count(${papers.id}) as int)`,
    })
    .from(subjects)
    .leftJoin(papers, eq(papers.subjectId, subjects.id))
    .groupBy(subjects.id)
    .orderBy(subjects.code);

  return rows;
}

export async function createSubject(input: CreateSubjectInput) {
  const [subject] = await db
    .insert(subjects)
    .values({
      id: subjectIdFor(input),
      code: input.code,
      name: input.name,
      description: input.description ?? "",
      status: input.status ?? "draft",
    })
    .returning();

  return subject;
}

export async function updateSubject(id: string, input: UpdateSubjectInput) {
  const [subject] = await db
    .update(subjects)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(subjects.id, id))
    .returning();

  return subject ?? null;
}

export async function deleteSubject(id: string) {
  const [subject] = await db.delete(subjects).where(eq(subjects.id, id)).returning({ id: subjects.id });
  return subject ?? null;
}

export async function getPapersForSubject(subjectId: string) {
  return await db
    .select({
      id: papers.id,
      title: papers.title,
      description: papers.description,
      position: papers.position,
      topicCount: sql<number>`cast(count(${topics.id}) as int)`,
    })
    .from(papers)
    .leftJoin(topics, eq(topics.paperId, papers.id))
    .where(eq(papers.subjectId, subjectId))
    .groupBy(papers.id)
    .orderBy(papers.position);
}

export async function getTopicsForPaper(paperId: string) {
  return await db
    .select({
      id: topics.id,
      title: topics.title,
      position: topics.position,
      lessonCount: sql<number>`cast(count(${lessons.id}) as int)`,
    })
    .from(topics)
    .leftJoin(lessons, eq(lessons.topicId, topics.id))
    .where(eq(topics.paperId, paperId))
    .groupBy(topics.id)
    .orderBy(topics.position);
}

export async function getLessonsForTopic(topicId: string) {
  return await db
    .select({
      id: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
      description: lessons.description,
      position: lessons.position,
      componentCount: sql<number>`cast(count(${lessonComponents.id}) as int)`,
    })
    .from(lessons)
    .leftJoin(lessonComponents, eq(lessonComponents.lessonId, lessons.id))
    .where(eq(lessons.topicId, topicId))
    .groupBy(lessons.id)
    .orderBy(lessons.position);
}
