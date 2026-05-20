import { createSubjectSchema, updateSubjectSchema } from "@faazhi/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  createSubject,
  deleteSubject,
  listSubjects,
  updateSubject,
} from "./subject.service.js";

const paramsSchema = z.object({
  id: z.string().min(1),
});

export async function subjectRoutes(app: FastifyInstance) {
  app.get("/subjects", async () => {
    return { data: await listSubjects() };
  });

  app.post("/subjects", async (request, reply) => {
    const input = createSubjectSchema.parse(request.body);
    const subject = await createSubject(input);
    return reply.status(201).send({ data: subject });
  });

  app.patch("/subjects/:id", async (request, reply) => {
    const { id } = paramsSchema.parse(request.params);
    const input = updateSubjectSchema.parse(request.body);
    const subject = await updateSubject(id, input);

    if (!subject) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Subject not found" } });
    }

    return { data: subject };
  });

  app.delete("/subjects/:id", async (request, reply) => {
    const { id } = paramsSchema.parse(request.params);
    const subject = await deleteSubject(id);

    if (!subject) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Subject not found" } });
    }

    return reply.status(204).send();
  });
}
