import type { IncomingMessage, ServerResponse } from "node:http";

import { getContext, requireAdmin } from "../../http/context.js";
import { json } from "../../http/respond.js";
import { readStore } from "../../storage/json-store.js";

export async function handleDashboard(
  request: IncomingMessage,
  response: ServerResponse,
  path: string,
) {
  if (request.method !== "GET" || path !== "/api/admin/dashboard") return false;

  const context = await getContext(request);
  requireAdmin(context);

  const store = await readStore();
  const students = store.users.filter((user) => user.role === "student");

  json(response, 200, {
    stats: {
      students: students.length,
      subjects: store.subjects.length,
      publishedLessons: store.lessons.filter((lesson) => lesson.status === "published").length,
      draftLessons: store.lessons.filter((lesson) => lesson.status === "draft").length,
      narrationFiles: store.narration.length,
    },
    recentStudents: students.slice(-5).reverse().map(({ password: _password, ...student }) => student),
  });

  return true;
}
