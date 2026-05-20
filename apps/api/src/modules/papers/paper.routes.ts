import { createPaperSchema, updatePaperSchema } from "@faazhi/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createPaper, deletePaper, getLearnPaper, listLearnPapers, listPapers, updatePaper } from "./paper.service.js";

const subjectParamsSchema = z.object({
  subjectId: z.string().min(1),
});

const paperParamsSchema = z.object({
  id: z.string().min(1),
});

const learnPaperParamsSchema = z.object({
  subjectId: z.string().min(1),
  paperId: z.string().min(1),
});

export async function paperRoutes(app: FastifyInstance) {
  app.get("/subjects/:subjectId/papers", async (request) => {
    const { subjectId } = subjectParamsSchema.parse(request.params);
    return { data: await listPapers(subjectId) };
  });

  app.get("/subjects/:subjectId/learn-papers", async (request) => {
    const { subjectId } = subjectParamsSchema.parse(request.params);
    return { data: await listLearnPapers(subjectId) };
  });

  app.get("/subjects/:subjectId/learn/:paperId", async (request, reply) => {
    const { subjectId, paperId } = learnPaperParamsSchema.parse(request.params);
    const paper = await getLearnPaper(subjectId, paperId);

    if (!paper) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Learn paper not found" } });
    }

    return { data: paper };
  });

  app.post("/subjects/:subjectId/papers", async (request, reply) => {
    const { subjectId } = subjectParamsSchema.parse(request.params);
    const input = createPaperSchema.parse(request.body);
    const result = await createPaper(subjectId, input);
    return reply.status(201).send({ data: result });
  });

  app.patch("/papers/:id", async (request, reply) => {
    const { id } = paperParamsSchema.parse(request.params);
    const input = updatePaperSchema.parse(request.body);
    const paper = await updatePaper(id, input);

    if (!paper) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Paper not found" } });
    }

    return { data: paper };
  });

  app.delete("/papers/:id", async (request, reply) => {
    const { id } = paperParamsSchema.parse(request.params);
    const paper = await deletePaper(id);

    if (!paper) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Paper not found" } });
    }

    return reply.status(204).send();
  });
}
