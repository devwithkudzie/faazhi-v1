import { randomBytes, randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { getContext, requireUser } from "../../http/context.js";
import { HttpError, json, noContent, readJson } from "../../http/respond.js";
import { nowIso } from "../../http/route.js";
import { readStore, writeStore } from "../../storage/json-store.js";

export async function handleAuth(
  request: IncomingMessage,
  response: ServerResponse,
  path: string,
) {
  if (request.method === "POST" && path === "/api/auth/sign-up") {
    const body = await readJson<{ name?: string; email?: string; password?: string }>(request);

    if (!body.name?.trim() || !body.email?.trim() || !body.password) {
      throw new HttpError(400, "Name, email and password are required.");
    }

    if (body.password.length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters.");
    }

    const store = await readStore();
    const normalizedEmail = body.email.trim().toLowerCase();
    const existingUser = store.users.find(
      (item) => item.email.toLowerCase() === normalizedEmail,
    );

    if (existingUser) {
      throw new HttpError(409, "An account with this email already exists.");
    }

    const freeSubjectIds = store.subjects
      .filter((subject) => subject.status === "published" && subject.isFree)
      .map((subject) => subject.id);
    const user = {
      id: randomUUID(),
      email: normalizedEmail,
      password: body.password,
      name: body.name.trim(),
      role: "student" as const,
      avatarColor: "hsl(218 65% 42%)",
      enrolledSubjectIds: freeSubjectIds,
      createdAt: nowIso(),
    };

    store.users.push(user);
    for (const subjectId of freeSubjectIds) {
      store.enrollments.push({
        id: randomUUID(),
        studentId: user.id,
        subjectId,
        status: "active",
        enrolledAt: nowIso(),
      });
    }

    const token = randomBytes(32).toString("base64url");
    store.sessions.push({ token, userId: user.id, createdAt: nowIso() });
    await writeStore(store);

    json(response, 201, { token, user: publicUser(user) });
    return true;
  }

  if (request.method === "POST" && path === "/api/auth/sign-in") {
    const body = await readJson<{ email?: string; password?: string }>(request);
    const store = await readStore();
    const user = store.users.find(
      (item) => item.email.toLowerCase() === body.email?.trim().toLowerCase(),
    );

    if (!user || user.password !== body.password) {
      throw new HttpError(401, "Email or password is incorrect.");
    }

    const token = randomBytes(32).toString("base64url");
    store.sessions.push({ token, userId: user.id, createdAt: nowIso() });
    await writeStore(store);

    json(response, 200, { token, user: publicUser(user) });
    return true;
  }

  if (request.method === "GET" && path === "/api/auth/me") {
    const context = await getContext(request);
    const user = requireUser(context);
    json(response, 200, { user: publicUser(user) });
    return true;
  }

  if (request.method === "POST" && path === "/api/auth/sign-out") {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

    if (token) {
      const store = await readStore();
      store.sessions = store.sessions.filter((item) => item.token !== token);
      await writeStore(store);
    }

    noContent(response);
    return true;
  }

  return false;
}

function publicUser<T extends { password: string }>(user: T) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
