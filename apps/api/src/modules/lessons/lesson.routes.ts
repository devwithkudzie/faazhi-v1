import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getLessonWithComponents, listLessons } from "./lesson.service.js";

const topicParamsSchema = z.object({
  topicId: z.string().min(1),
});

const lessonParamsSchema = z.object({
  id: z.string().min(1),
});

export async function lessonRoutes(app: FastifyInstance) {
  app.get("/topics/:topicId/lessons", async (request) => {
    const { topicId } = topicParamsSchema.parse(request.params);
    return { data: await listLessons(topicId) };
  });

  app.get("/lessons/:id", async (request, reply) => {
    const { id } = lessonParamsSchema.parse(request.params);
    const lesson = await getLessonWithComponents(id);

    if (!lesson) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Lesson not found" } });
    }

    return { data: lesson };
  });
}
