import cors from "@fastify/cors";
import Fastify from "fastify";
import { config } from "./config.js";
import { errorHandler } from "./middleware/error-handler.js";
import { lessonRoutes } from "./modules/lessons/lesson.routes.js";
import { paperRoutes } from "./modules/papers/paper.routes.js";
import { subjectRoutes } from "./modules/subjects/subject.routes.js";
import { topicRoutes } from "./modules/topics/topic.routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: config.NODE_ENV !== "test",
  });

  await app.register(cors, {
    origin: config.WEB_ORIGIN,
    credentials: true,
  });

  app.setErrorHandler(errorHandler);

  app.get("/health", async () => ({
    data: {
      status: "ok",
    },
  }));

  await app.register(subjectRoutes, { prefix: "/api" });
  await app.register(paperRoutes, { prefix: "/api" });
  await app.register(topicRoutes, { prefix: "/api" });
  await app.register(lessonRoutes, { prefix: "/api" });

  return app;
}
