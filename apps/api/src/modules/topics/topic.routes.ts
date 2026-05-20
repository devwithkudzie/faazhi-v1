import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { listTopics } from "./topic.service.js";

const paramsSchema = z.object({
  paperId: z.string().min(1),
});

export async function topicRoutes(app: FastifyInstance) {
  app.get("/papers/:paperId/topics", async (request) => {
    const { paperId } = paramsSchema.parse(request.params);
    return { data: await listTopics(paperId) };
  });
}
