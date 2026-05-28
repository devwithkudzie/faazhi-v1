import type { IncomingMessage, ServerResponse } from "node:http";

import { applyCors } from "./http/cors.js";
import { HttpError, json } from "./http/respond.js";
import { handleAuth } from "./modules/auth/auth.routes.js";
import { handleDashboard } from "./modules/dashboard/dashboard.routes.js";
import { handleLessons } from "./modules/lessons/lessons.routes.js";
import { handleNarration } from "./modules/narration/narration.routes.js";
import { handleProgress } from "./modules/progress/progress.routes.js";
import { handleSubjects } from "./modules/subjects/subjects.routes.js";
import { handleUsers } from "./modules/users/users.routes.js";
import { serveUpload } from "./static/uploads.js";

type RouteHandler = (
  request: IncomingMessage,
  response: ServerResponse,
  path: string,
) => Promise<boolean>;

const handlers: RouteHandler[] = [
  handleAuth,
  handleUsers,
  handleSubjects,
  handleLessons,
  handleProgress,
  handleNarration,
  handleDashboard,
];

export async function app(request: IncomingMessage, response: ServerResponse) {
  applyCors(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    const routePath = url.pathname;

    if (request.method === "GET" && routePath === "/health") {
      json(response, 200, { ok: true });
      return;
    }

    if (request.method === "GET" && routePath.startsWith("/uploads/")) {
      await serveUpload(response, routePath);
      return;
    }

    for (const handler of handlers) {
      if (await handler(request, response, routePath)) return;
    }

    json(response, 404, { error: "Route was not found." });
  } catch (error) {
    if (error instanceof HttpError) {
      json(response, error.status, { error: error.message });
      return;
    }

    console.error(error);
    json(response, 500, { error: "Unexpected server error." });
  }
}
