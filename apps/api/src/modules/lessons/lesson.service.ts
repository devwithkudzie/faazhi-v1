import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { lessonComponents, lessons } from "../../db/schema.js";

export async function listLessons(topicId: string) {
  return db.select().from(lessons).where(eq(lessons.topicId, topicId)).orderBy(lessons.position, lessons.title);
}

export async function getLessonWithComponents(id: string) {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, id),
    with: {
      components: {
        orderBy: [lessonComponents.position],
      },
    },
  });

  return lesson ?? null;
}
