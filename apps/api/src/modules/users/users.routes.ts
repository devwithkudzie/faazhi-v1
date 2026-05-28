import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { getContext, requireAdmin, requireUser } from "../../http/context.js";
import { HttpError, json, readJson } from "../../http/respond.js";
import { matchPath, nowIso } from "../../http/route.js";
import { readStore, writeStore } from "../../storage/json-store.js";
import type { UserRole } from "../../domain/types.js";

export async function handleUsers(
  request: IncomingMessage,
  response: ServerResponse,
  path: string,
) {
  const context = await getContext(request);

  if (request.method === "GET" && path === "/api/admin/users") {
    requireAdmin(context);
    const store = await readStore();
    json(response, 200, {
      users: store.users.map((user) => ({
        ...publicUser(user),
        subjectAccess: store.subjectAccess.filter(
          (item) => item.studentId === user.id,
        ),
      })),
    });
    return true;
  }

  if (request.method === "POST" && path === "/api/admin/users") {
    requireAdmin(context);
    const body = await readJson<Partial<{ email: string; password: string; name: string; role: UserRole; enrolledSubjectIds: string[] }>>(request);

    if (!body.email || !body.password || !body.name || !body.role) {
      throw new HttpError(400, "email, password, name and role are required.");
    }

    if (!["student", "admin"].includes(body.role)) {
      throw new HttpError(400, "Only student and admin accounts are supported.");
    }

    const store = await readStore();
    const user = {
      id: randomUUID(),
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
      avatarColor: "hsl(218 65% 42%)",
      enrolledSubjectIds: body.role === "student" ? body.enrolledSubjectIds ?? [] : [],
      createdAt: nowIso(),
    };

    store.users.push(user);
    await writeStore(store);
    json(response, 201, { user: publicUser(user) });
    return true;
  }

  const userMatch = matchPath("/api/admin/users/:userId", path);
  if (request.method === "PATCH" && userMatch) {
    requireAdmin(context);
    const body = await readJson<Partial<{ name: string; email: string; enrolledSubjectIds: string[] }>>(request);
    const store = await readStore();
    const user = store.users.find((item) => item.id === userMatch.params.userId);

    if (!user) throw new HttpError(404, "User was not found.");

    user.name = body.name ?? user.name;
    user.email = body.email ?? user.email;
    user.enrolledSubjectIds = user.role === "student" ? body.enrolledSubjectIds ?? user.enrolledSubjectIds : [];

    store.enrollments = store.enrollments.filter((item) => item.studentId !== user.id);
    for (const subjectId of user.enrolledSubjectIds) {
      store.enrollments.push({ id: randomUUID(), studentId: user.id, subjectId, status: "active", enrolledAt: nowIso() });
    }

    await writeStore(store);
    json(response, 200, { user: publicUser(user) });
    return true;
  }

  if (request.method === "GET" && path === "/api/account") {
    const user = requireUser(context);
    const store = await readStore();
    json(response, 200, { user: publicUser(user), settings: store.accountSettings });
    return true;
  }

  if (request.method === "PATCH" && path === "/api/account") {
    requireAdmin(context);
    const body = await readJson<Partial<{ productName: string; supportEmail: string; defaultStudentTheme: string }>>(request);
    const store = await readStore();
    store.accountSettings = { ...store.accountSettings, ...body };
    await writeStore(store);
    json(response, 200, { settings: store.accountSettings });
    return true;
  }

  return false;
}

function publicUser<T extends { password: string }>(user: T) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
