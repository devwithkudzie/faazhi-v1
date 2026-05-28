import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import type { ServerResponse } from "node:http";
import path from "node:path";

import { env } from "../config/env.js";
import { HttpError } from "../http/respond.js";

export async function serveUpload(response: ServerResponse, routePath: string) {
  const relativePath = routePath.replace(/^\/uploads\//, "");
  const filePath = path.join(env.uploadDir, relativePath);
  const uploadRoot = path.resolve(env.uploadDir);
  const resolvedPath = path.resolve(filePath);

  if (!resolvedPath.startsWith(uploadRoot)) {
    throw new HttpError(400, "Invalid upload path.");
  }

  await stat(resolvedPath);

  response.writeHead(200, { "content-type": contentTypeFor(resolvedPath) });
  createReadStream(resolvedPath).pipe(response);
}

function contentTypeFor(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".wav") return "audio/wav";
  if (extension === ".ogg") return "audio/ogg";
  if (extension === ".webm") return "audio/webm";
  if (extension === ".m4a") return "audio/mp4";
  return "audio/mpeg";
}
