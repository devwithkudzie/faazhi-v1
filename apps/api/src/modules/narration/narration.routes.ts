import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

import { env } from "../../config/env.js";
import { getContext, requireAdmin, requireUser } from "../../http/context.js";
import { HttpError, json, readJson } from "../../http/respond.js";
import { matchPath, nowIso } from "../../http/route.js";
import { readStore, writeStore } from "../../storage/json-store.js";

const allowedAudioTypes = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4"]);

export async function handleNarration(
  request: IncomingMessage,
  response: ServerResponse,
  routePath: string,
) {
  const context = await getContext(request);

  if (request.method === "POST" && routePath === "/api/narration") {
    requireAdmin(context);
    const body = await readJson<{
      lessonId?: string;
      sceneId?: string;
      fileName?: string;
      contentType?: string;
      base64?: string;
      durationSeconds?: number;
      transcript?: string;
    }>(request);

    if (!body.lessonId || !body.fileName || !body.contentType || !body.base64) {
      throw new HttpError(400, "lessonId, fileName, contentType and base64 are required.");
    }

    if (!allowedAudioTypes.has(body.contentType)) {
      throw new HttpError(400, "Only audio files are supported.");
    }

    const store = await readStore();
    const lesson = store.lessons.find((item) => item.id === body.lessonId);
    if (!lesson) throw new HttpError(404, "Lesson was not found.");

    const extension = path.extname(body.fileName) || extensionFor(body.contentType);
    const safeName = `${randomUUID()}${extension}`;
    const audioDir = path.join(env.uploadDir, "audio");
    await mkdir(audioDir, { recursive: true });
    await writeFile(path.join(audioDir, safeName), Buffer.from(body.base64, "base64"));

    const audio = {
      id: randomUUID(),
      lessonId: body.lessonId,
      sceneId: body.sceneId,
      fileName: body.fileName,
      contentType: body.contentType,
      fileUrl: `/uploads/audio/${safeName}`,
      durationSeconds: body.durationSeconds,
      transcript: body.transcript,
      createdAt: nowIso(),
    };

    store.narration.push(audio);

    if (body.sceneId) {
      const scene = store.scenes.find((item) => item.id === body.sceneId);
      if (scene) scene.narrationAudioId = audio.id;
    }

    await writeStore(store);
    json(response, 201, { narration: audio });
    return true;
  }

  const lessonNarrationMatch = matchPath("/api/lessons/:lessonId/narration", routePath);
  if (lessonNarrationMatch && request.method === "GET") {
    requireUser(context);
    const store = await readStore();
    json(response, 200, {
      narration: store.narration.filter((item) => item.lessonId === lessonNarrationMatch.params.lessonId),
    });
    return true;
  }

  return false;
}

function extensionFor(contentType: string) {
  if (contentType === "audio/wav") return ".wav";
  if (contentType === "audio/ogg") return ".ogg";
  if (contentType === "audio/webm") return ".webm";
  if (contentType === "audio/mp4") return ".m4a";
  return ".mp3";
}
