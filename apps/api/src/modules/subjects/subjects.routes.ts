import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { getContext, requireAdmin, requireUser } from "../../http/context.js";
import { HttpError, json, noContent, readJson } from "../../http/respond.js";
import { matchPath, nowIso } from "../../http/route.js";
import { readStore, writeStore } from "../../storage/json-store.js";
import type { Paper, PublishStatus, Scene, SceneBlock, StoreData, Subject, SubjectAccess, SubjectLevel } from "../../domain/types.js";

export async function handleSubjects(
  request: IncomingMessage,
  response: ServerResponse,
  path: string,
) {
  const context = await getContext(request);

  if (request.method === "GET" && path === "/api/subjects") {
    const user = requireUser(context);
    const store = await readStore();
    const subjects = user.role === "admin"
      ? store.subjects
      : store.subjects.filter(
          (subject) =>
            subject.status === "published" &&
            canAccessSubject(subject, user.id, store.subjectAccess),
        );

    json(response, 200, { subjects });
    return true;
  }

  if (request.method === "GET" && path === "/api/explore/subjects") {
    const user = requireUser(context);
    const store = await readStore();
    const subjects = store.subjects
      .filter((subject) => subject.status === "published")
      .map((subject) => ({
        ...subject,
        access: getSubjectAccessState(subject, user.id, store.subjectAccess),
        lessonCount: store.lessons.filter((lesson) => {
          const paper = store.papers.find((item) => item.id === lesson.paperId);
          return (
            lesson.subjectId === subject.id &&
            lesson.status === "published" &&
            paper?.status === "published"
          );
        }).length,
      }));

    json(response, 200, { subjects });
    return true;
  }

  if (request.method === "POST" && path === "/api/subjects") {
    requireAdmin(context);
    const body = await readJson<Partial<{ code: string; name: string; description: string; level: SubjectLevel }>>(request);

    if (!body.code || !body.name) {
      throw new HttpError(400, "code and name are required.");
    }

    const store = await readStore();
    const existingSubject = store.subjects.find(
      (subject) => subject.id === body.code || subject.code === body.code,
    );

    if (existingSubject) {
      throw new HttpError(409, "A subject with this code already exists.");
    }

    const subject = {
      id: body.code,
      code: body.code,
      name: body.name,
      description: body.description ?? "",
      level: body.level ?? "a-level",
      status: "draft" as PublishStatus,
      isFree: false,
      theme: { accent: "#155EEF", canvasBackground: "#F8FBFF" },
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    store.subjects.push(subject);
    const paper: Paper = {
      id: `paper-${subject.id}-1`,
      subjectId: subject.id,
      title: "Paper 1",
      description: "Starter module with sample curriculum structure for content authors.",
      estimatedTime: "30-45 min authoring sample",
      status: "draft",
      order: 1,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
    store.papers.push(paper);
    createStarterCurriculum(store, subject, paper);
    await writeStore(store);
    json(response, 201, { subject });
    return true;
  }

  const subjectMatch = matchPath("/api/subjects/:subjectId", path);
  if (subjectMatch && request.method === "GET") {
    requireUser(context);
    const store = await readStore();
    const subject = store.subjects.find((item) => item.id === subjectMatch.params.subjectId);
    if (!subject) throw new HttpError(404, "Subject was not found.");
    json(response, 200, { subject });
    return true;
  }

  if (subjectMatch && request.method === "PATCH") {
    requireAdmin(context);
    const body = await readJson<Partial<{ code: string; name: string; description: string; level: SubjectLevel; status: PublishStatus; isFree: boolean; theme: { accent: string; canvasBackground: string } }>>(request);
    const store = await readStore();
    const subject = store.subjects.find((item) => item.id === subjectMatch.params.subjectId);
    if (!subject) throw new HttpError(404, "Subject was not found.");

    subject.code = body.code ?? subject.code;
    subject.name = body.name ?? subject.name;
    subject.description = body.description ?? subject.description;
    subject.level = body.level ?? subject.level;
    if (body.status === "published") {
      const hasPublishedPaper = store.papers.some(
        (paper) => paper.subjectId === subject.id && paper.status === "published",
      );
      if (!hasPublishedPaper) {
        throw new HttpError(400, "Select at least one paper to publish with this subject.");
      }
    }

    subject.status = body.status ?? subject.status;
    subject.isFree = body.isFree ?? subject.isFree;
    subject.theme = body.theme ?? subject.theme;
    subject.updatedAt = nowIso();

    await writeStore(store);
    json(response, 200, { subject });
    return true;
  }

  const subjectPublishMatch = matchPath("/api/subjects/:subjectId/publish", path);
  if (subjectPublishMatch && request.method === "POST") {
    requireAdmin(context);
    const body = await readJson<{ paperIds?: string[] }>(request);
    const paperIds = body.paperIds ?? [];

    if (paperIds.length === 0) {
      throw new HttpError(400, "Select at least one paper/module to publish.");
    }

    const store = await readStore();
    const subject = store.subjects.find((item) => item.id === subjectPublishMatch.params.subjectId);
    if (!subject) throw new HttpError(404, "Subject was not found.");

    const selectedPapers = store.papers.filter(
      (paper) => paper.subjectId === subject.id && paperIds.includes(paper.id),
    );

    if (selectedPapers.length === 0) {
      throw new HttpError(400, "Selected papers do not belong to this subject.");
    }

    const updatedAt = nowIso();
    subject.status = "published";
    subject.updatedAt = updatedAt;
    selectedPapers.forEach((paper) => {
      paper.status = "published";
      paper.updatedAt = updatedAt;
    });

    await writeStore(store);
    json(response, 200, { subject, papers: selectedPapers });
    return true;
  }

  if (subjectMatch && request.method === "DELETE") {
    requireAdmin(context);
    const store = await readStore();
    const subject = store.subjects.find((item) => item.id === subjectMatch.params.subjectId);
    if (!subject) throw new HttpError(404, "Subject was not found.");

    if (subject.status === "published") {
      throw new HttpError(409, "Unpublish the subject before deleting it.");
    }

    const paperIds = store.papers
      .filter((paper) => paper.subjectId === subject.id)
      .map((paper) => paper.id);
    const lessonIds = store.lessons
      .filter((lesson) => lesson.subjectId === subject.id || paperIds.includes(lesson.paperId))
      .map((lesson) => lesson.id);
    const sceneIds = store.scenes
      .filter((scene) => lessonIds.includes(scene.lessonId))
      .map((scene) => scene.id);

    store.subjects = store.subjects.filter((item) => item.id !== subject.id);
    store.papers = store.papers.filter((paper) => paper.subjectId !== subject.id);
    store.lessons = store.lessons.filter((lesson) => !lessonIds.includes(lesson.id));
    store.scenes = store.scenes.filter((scene) => !sceneIds.includes(scene.id));
    store.blocks = store.blocks.filter((block) => !sceneIds.includes(block.sceneId));
    store.workspaces = store.workspaces.filter((workspace) => !paperIds.includes(workspace.paperId));
    store.narration = store.narration.filter((audio) => !lessonIds.includes(audio.lessonId));
    store.progress = store.progress.filter((progress) => !lessonIds.includes(progress.lessonId));
    store.subjectAccess = store.subjectAccess.filter((access) => access.subjectId !== subject.id);
    store.enrollments = store.enrollments.filter((enrollment) => enrollment.subjectId !== subject.id);
    store.users = store.users.map((user) => ({
      ...user,
      enrolledSubjectIds: user.enrolledSubjectIds.filter((subjectId) => subjectId !== subject.id),
    }));

    await writeStore(store);
    noContent(response);
    return true;
  }

  const trialMatch = matchPath("/api/subjects/:subjectId/trial", path);
  if (trialMatch && request.method === "POST") {
    const user = requireUser(context);
    const store = await readStore();
    const subject = store.subjects.find((item) => item.id === trialMatch.params.subjectId);

    if (!subject || subject.status !== "published") {
      throw new HttpError(404, "Subject was not found.");
    }

    if (subject.isFree) {
      ensureEnrollment(store, user.id, subject.id);
      await writeStore(store);
      json(response, 200, { access: getSubjectAccessState(subject, user.id, store.subjectAccess) });
      return true;
    }

    const existingAccess = store.subjectAccess.find(
      (item) => item.studentId === user.id && item.subjectId === subject.id,
    );

    if (existingAccess) {
      json(response, 200, { access: getSubjectAccessState(subject, user.id, store.subjectAccess) });
      return true;
    }

    const trialStartedAt = nowIso();
    const trialEndsAt = addDaysIso(7);
    store.subjectAccess.push({
      id: randomUUID(),
      studentId: user.id,
      subjectId: subject.id,
      status: "trialing",
      trialStartedAt,
      trialEndsAt,
      updatedAt: trialStartedAt,
    });
    ensureEnrollment(store, user.id, subject.id);

    await writeStore(store);
    json(response, 201, { access: getSubjectAccessState(subject, user.id, store.subjectAccess) });
    return true;
  }

  const unsubscribeMatch = matchPath("/api/subjects/:subjectId/unsubscribe", path);
  if (unsubscribeMatch && request.method === "POST") {
    const user = requireUser(context);
    const store = await readStore();
    const subject = store.subjects.find(
      (item) => item.id === unsubscribeMatch.params.subjectId,
    );

    if (!subject || subject.status !== "published") {
      throw new HttpError(404, "Subject was not found.");
    }

    if (subject.isFree) {
      throw new HttpError(400, "Free subjects cannot be unsubscribed.");
    }

    const access = store.subjectAccess.find(
      (item) => item.studentId === user.id && item.subjectId === subject.id,
    );

    if (access) {
      access.status = "cancelled";
      access.cancelledAt = nowIso();
      access.updatedAt = nowIso();
    }

    store.enrollments = store.enrollments.filter(
      (item) => !(item.studentId === user.id && item.subjectId === subject.id),
    );
    user.enrolledSubjectIds = user.enrolledSubjectIds.filter(
      (subjectId) => subjectId !== subject.id,
    );

    await writeStore(store);
    json(response, 200, { access: getSubjectAccessState(subject, user.id, store.subjectAccess) });
    return true;
  }

  const adminAccessMatch = matchPath("/api/admin/users/:userId/subject-access/:subjectId", path);
  if (adminAccessMatch && request.method === "PATCH") {
    requireAdmin(context);
    const body = await readJson<{ status?: "none" | "trialing" | "active" | "expired" | "cancelled" }>(request);
    const store = await readStore();
    const user = store.users.find((item) => item.id === adminAccessMatch.params.userId);
    const subject = store.subjects.find((item) => item.id === adminAccessMatch.params.subjectId);

    if (!user || user.role !== "student" || !subject) {
      throw new HttpError(404, "Student or subject was not found.");
    }

    const now = nowIso();
    store.subjectAccess = store.subjectAccess.filter(
      (item) => !(item.studentId === user.id && item.subjectId === subject.id),
    );

    if (body.status && body.status !== "none") {
      store.subjectAccess.push({
        id: randomUUID(),
        studentId: user.id,
        subjectId: subject.id,
        status: body.status,
        trialStartedAt: body.status === "trialing" ? now : undefined,
        trialEndsAt: body.status === "trialing" ? addDaysIso(7) : undefined,
        subscribedAt: body.status === "active" ? now : undefined,
        currentPeriodEndsAt: body.status === "active" ? addDaysIso(30) : undefined,
        cancelledAt: body.status === "cancelled" ? now : undefined,
        updatedAt: now,
      });
      ensureEnrollment(store, user.id, subject.id);
    }

    if (body.status === "none") {
      store.enrollments = store.enrollments.filter(
        (item) => !(item.studentId === user.id && item.subjectId === subject.id),
      );
      user.enrolledSubjectIds = user.enrolledSubjectIds.filter((subjectId) => subjectId !== subject.id);
    }

    await writeStore(store);
    json(response, 200, { access: getSubjectAccessState(subject, user.id, store.subjectAccess) });
    return true;
  }

  if (request.method === "POST" && path === "/api/enrollments") {
    requireAdmin(context);
    const body = await readJson<{ studentId?: string; subjectId?: string }>(request);
    if (!body.studentId || !body.subjectId) throw new HttpError(400, "studentId and subjectId are required.");

    const store = await readStore();
    const user = store.users.find((item) => item.id === body.studentId);
    const subject = store.subjects.find((item) => item.id === body.subjectId);
    if (!user || user.role !== "student" || !subject) throw new HttpError(404, "Student or subject was not found.");

    if (!user.enrolledSubjectIds.includes(subject.id)) user.enrolledSubjectIds.push(subject.id);
    store.enrollments.push({ id: randomUUID(), studentId: user.id, subjectId: subject.id, status: "active", enrolledAt: nowIso() });
    await writeStore(store);
    json(response, 201, { enrolledSubjectIds: user.enrolledSubjectIds });
    return true;
  }

  return false;
}

function getSubjectAccessState(
  subject: Subject,
  studentId: string,
  accessList: SubjectAccess[],
) {
  if (subject.isFree) {
    return {
      status: "free",
      hasAccess: true,
      label: "Free",
    };
  }

  const access = accessList.find(
    (item) => item.studentId === studentId && item.subjectId === subject.id,
  );

  if (!access) {
    return {
      status: "locked",
      hasAccess: false,
      label: "Subscription required",
    };
  }

  const trialExpired =
    access.status === "trialing" &&
    access.trialEndsAt &&
    new Date(access.trialEndsAt).getTime() < Date.now();
  const activeExpired =
    access.status === "active" &&
    access.currentPeriodEndsAt &&
    new Date(access.currentPeriodEndsAt).getTime() < Date.now();

  if (trialExpired || activeExpired) {
    return {
      status: "expired",
      hasAccess: false,
      label: "Access ended",
      trialEndsAt: access.trialEndsAt,
      currentPeriodEndsAt: access.currentPeriodEndsAt,
    };
  }

  return {
    status: access.status,
    hasAccess: access.status === "trialing" || access.status === "active",
    label: labelForAccess(access.status),
    trialEndsAt: access.trialEndsAt,
    currentPeriodEndsAt: access.currentPeriodEndsAt,
  };
}

function canAccessSubject(
  subject: Subject,
  studentId: string,
  accessList: SubjectAccess[],
) {
  return getSubjectAccessState(subject, studentId, accessList).hasAccess;
}

function ensureEnrollment(
  store: Awaited<ReturnType<typeof readStore>>,
  studentId: string,
  subjectId: string,
) {
  const user = store.users.find((item) => item.id === studentId);
  if (user && !user.enrolledSubjectIds.includes(subjectId)) {
    user.enrolledSubjectIds.push(subjectId);
  }

  const existingEnrollment = store.enrollments.some(
    (item) => item.studentId === studentId && item.subjectId === subjectId,
  );

  if (!existingEnrollment) {
    store.enrollments.push({
      id: randomUUID(),
      studentId,
      subjectId,
      status: "active",
      enrolledAt: nowIso(),
    });
  }
}

function createStarterCurriculum(
  store: StoreData,
  subject: Subject,
  paper: Paper,
) {
  const lesson: StoreData["lessons"][number] = {
    id: `lesson-${subject.id}-welcome`,
    subjectId: subject.id,
    paperId: paper.id,
    title: "Welcome lesson",
    description:
      "Sample lesson showing the expected flow: intro, concept, example, and embedded checkpoint.",
    status: "draft",
    estimatedMinutes: 12,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
  };

  const scenes: Scene[] = [
    {
      id: `scene-${subject.id}-intro`,
      lessonId: lesson.id,
      title: "Intro scene",
      type: "concept",
      status: "draft",
      order: 1,
      durationSeconds: 35,
      animation: "fade",
      background: "#F8FBFF",
    },
    {
      id: `scene-${subject.id}-concept`,
      lessonId: lesson.id,
      title: "Concept scene",
      type: "diagram",
      status: "draft",
      order: 2,
      durationSeconds: 45,
      animation: "fade",
      background: "#F8FBFF",
    },
    {
      id: `scene-${subject.id}-example`,
      lessonId: lesson.id,
      title: "Example scene",
      type: "example",
      status: "draft",
      order: 3,
      durationSeconds: 50,
      animation: "fade",
      background: "#FFFFFF",
    },
    {
      id: `scene-${subject.id}-checkpoint`,
      lessonId: lesson.id,
      title: "Embedded checkpoint scene",
      type: "checkpoint",
      status: "draft",
      order: 4,
      durationSeconds: 40,
      animation: "fade",
      background: "#EEF5FF",
    },
  ];

  const blocks: SceneBlock[] = [
    {
      id: `block-${subject.id}-intro-heading`,
      sceneId: scenes[0].id,
      type: "paragraph",
      content: `Welcome to ${subject.name}. Replace this with a learner-friendly hook.`,
      alignX: "center",
      alignY: "middle",
      stepIndex: 1,
      startTime: 0,
      duration: 8,
      animation: "fade",
      order: 1,
    },
    {
      id: `block-${subject.id}-concept-list`,
      sceneId: scenes[1].id,
      type: "list",
      content: "Use this scene to explain the core idea.",
      items: ["Define the concept", "Show the pattern", "Connect it to an exam skill"],
      listKind: "bullet",
      alignX: "center",
      alignY: "middle",
      stepIndex: 1,
      startTime: 0,
      duration: 12,
      animation: "fade",
      order: 1,
    },
    {
      id: `block-${subject.id}-example`,
      sceneId: scenes[2].id,
      type: "keyIdea",
      content:
        "Worked example: model one step, then let the learner predict the next step.",
      alignX: "center",
      alignY: "middle",
      stepIndex: 1,
      startTime: 0,
      duration: 10,
      animation: "fade",
      order: 1,
    },
    {
      id: `block-${subject.id}-checkpoint`,
      sceneId: scenes[3].id,
      type: "paragraph",
      content: "Checkpoint: ask one quick question before the learner moves on.",
      alignX: "center",
      alignY: "middle",
      stepIndex: 1,
      startTime: 0,
      duration: 8,
      animation: "fade",
      order: 1,
    },
  ];

  store.lessons.push(lesson);
  store.scenes.push(...scenes);
  store.blocks.push(...blocks);
}

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function labelForAccess(status: SubjectAccess["status"]) {
  if (status === "trialing") return "Free trial";
  if (status === "active") return "Subscribed";
  if (status === "expired") return "Expired";
  return "Cancelled";
}
