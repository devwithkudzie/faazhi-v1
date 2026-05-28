import type { IncomingMessage } from "node:http";

import { HttpError } from "./respond.js";
import { readStore } from "../storage/json-store.js";
import type { User } from "../domain/types.js";

export interface RequestContext {
  user?: User;
}

export async function getContext(request: IncomingMessage): Promise<RequestContext> {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) return {};

  const store = await readStore();
  const session = store.sessions.find((item) => item.token === token);
  const user = session ? store.users.find((item) => item.id === session.userId) : undefined;

  return { user };
}

export function requireUser(context: RequestContext): User {
  if (!context.user) {
    throw new HttpError(401, "Sign in is required.");
  }

  return context.user;
}

export function requireAdmin(context: RequestContext): User {
  const user = requireUser(context);

  if (user.role !== "admin") {
    throw new HttpError(403, "Admin access is required.");
  }

  return user;
}
