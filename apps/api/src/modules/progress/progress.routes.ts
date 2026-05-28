import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { getContext, requireUser } from "../../http/context.js";
import { json, readJson } from "../../http/respond.js";
import { matchPath, nowIso } from "../../http/route.js";
import { readStore, writeStore } from "../../storage/json-store.js";

export async function handleProgress(
  request: IncomingMessage,
  response: ServerResponse,
  path: string,
) {
  const context = await getContext(request);
  const progressMatch = matchPath("/api/student/progress/:lessonId", path);

  if (progressMatch && request.method === "PATCH") {
    const user = requireUser(context);
    const body = await readJson<Partial<{ sceneId: string; completed: boolean; lastPositionSeconds: number }>>(request);
    const store = await readStore();
    let progress = store.progress.find((item) => item.studentId === user.id && item.lessonId === progressMatch.params.lessonId);

    if (!progress) {
      progress = {
        id: randomUUID(),
        studentId: user.id,
        lessonId: progressMatch.params.lessonId,
        completed: false,
        lastPositionSeconds: 0,
        updatedAt: nowIso(),
      };
      store.progress.push(progress);
    }

    progress.sceneId = body.sceneId ?? progress.sceneId;
    progress.completed = body.completed ?? progress.completed;
    progress.lastPositionSeconds = body.lastPositionSeconds ?? progress.lastPositionSeconds;
    progress.updatedAt = nowIso();

    await writeStore(store);
    json(response, 200, { progress });
    return true;
  }

  if (request.method === "GET" && path === "/api/student/progress") {
    const user = requireUser(context);
    const store = await readStore();
    json(response, 200, { progress: store.progress.filter((item) => item.studentId === user.id) });
    return true;
  }

  return false;
}
