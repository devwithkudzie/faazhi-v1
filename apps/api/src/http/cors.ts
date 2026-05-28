import type { IncomingMessage, ServerResponse } from "node:http";

import { env } from "../config/env.js";

export function applyCors(request: IncomingMessage, response: ServerResponse) {
  const origin = request.headers.origin;
  response.setHeader("access-control-allow-origin", origin || env.corsOrigin);
  response.setHeader("vary", "origin");
  response.setHeader("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type,authorization");
}
