import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { getContext, requireAdmin, requireUser } from "../../http/context.js";
import { HttpError, json, noContent, readJson } from "../../http/respond.js";
import { matchPath, nowIso } from "../../http/route.js";
import { readStore, writeStore } from "../../storage/json-store.js";
import type { Lesson, Paper, PublishStatus, Scene, SceneAnimation, SceneBlock, SceneBlockType, StoreData, Subject, SubjectAccess } from "../../domain/types.js";

export async function handleLessons(
  request: IncomingMessage,
  response: ServerResponse,
  path: string,
) {
  const context = await getContext(request);

  const subjectPapersMatch = matchPath("/api/subjects/:subjectId/papers", path);
  if (subjectPapersMatch && request.method === "GET") {
    const user = requireUser(context);
    const store = await readStore();
    const subject = store.subjects.find((item) => item.id === subjectPapersMatch.params.subjectId);
    const papers = store.papers
      .filter((paper) => {
        if (paper.subjectId !== subjectPapersMatch.params.subjectId) return false;
        if (user.role === "admin") return true;
        return subject?.status === "published" && paper.status === "published";
      })
      .sort((a, b) => a.order - b.order);
    json(response, 200, { papers });
    return true;
  }

  if (subjectPapersMatch && request.method === "POST") {
    requireAdmin(context);
    const body = await readJson<Partial<Paper>>(request);
    const store = await readStore();
    const subject = store.subjects.find((item) => item.id === subjectPapersMatch.params.subjectId);
    if (!subject) throw new HttpError(404, "Subject was not found.");
    const paper: Paper = {
      id: randomUUID(),
      subjectId: subject.id,
      title: body.title ?? "Untitled paper",
      description:
        body.description ??
        "Paper outline placeholder. Add subject-specific details in the paper workspace.",
      estimatedTime: body.estimatedTime ?? "To be planned",
      status: body.status ?? "draft",
      order:
        body.order ??
        store.papers.filter((item) => item.subjectId === subject.id).length + 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.papers.push(paper);
    createPaperStarterContent(store, subject, paper);
    await writeStore(store);
    json(response, 201, { paper });
    return true;
  }

  const paperWorkspaceMatch = matchPath("/api/papers/:paperId/workspace", path);
  if (paperWorkspaceMatch && request.method === "GET") {
    const user = requireUser(context);
    const store = await readStore();
    const paper = store.papers.find((item) => item.id === paperWorkspaceMatch.params.paperId);
    if (!paper) throw new HttpError(404, "Paper was not found.");
    const subject = store.subjects.find((item) => item.id === paper.subjectId);

    if (
      user.role !== "admin" &&
      (!subject ||
        subject.status !== "published" ||
        paper.status !== "published" ||
        !canAccessSubject(subject, user.id, store.subjectAccess))
    ) {
      throw new HttpError(403, "Subscribe or start a trial to access this paper.");
    }

    const workspace = store.workspaces.find((item) => item.paperId === paper.id);
    json(response, 200, {
      workspace: workspace?.draft ?? null,
      updatedAt: workspace?.updatedAt ?? null,
    });
    return true;
  }

  if (paperWorkspaceMatch && request.method === "PUT") {
    requireAdmin(context);
    const body = await readJson<{ draft?: WorkspaceDraft }>(request);
    const draft = body.draft;
    if (!draft) throw new HttpError(400, "Workspace draft is required.");

    const store = await readStore();
    const paper = store.papers.find((item) => item.id === paperWorkspaceMatch.params.paperId);
    if (!paper) throw new HttpError(404, "Paper was not found.");
    const subject = store.subjects.find((item) => item.id === paper.subjectId);
    if (!subject) throw new HttpError(404, "Subject was not found.");
    if (draft.paperId !== paper.id || draft.subjectId !== subject.id) {
      throw new HttpError(400, "Workspace draft does not match this paper.");
    }

    saveWorkspaceDraft(store, subject, paper, draft);
    await writeStore(store);
    json(response, 200, { workspace: draft, subject, paper });
    return true;
  }

  const paperMatch = matchPath("/api/papers/:paperId", path);
  if (paperMatch && request.method === "PATCH") {
    requireAdmin(context);
    const body = await readJson<Partial<Paper>>(request);
    const store = await readStore();
    const paper = store.papers.find((item) => item.id === paperMatch.params.paperId);
    if (!paper) throw new HttpError(404, "Paper was not found.");
    Object.assign(paper, {
      ...body,
      id: paper.id,
      subjectId: paper.subjectId,
      updatedAt: nowIso(),
    });
    await writeStore(store);
    json(response, 200, { paper });
    return true;
  }

  const paperPublishMatch = matchPath("/api/papers/:paperId/publish", path);
  if (paperPublishMatch && request.method === "POST") {
    requireAdmin(context);
    const store = await readStore();
    const paper = store.papers.find((item) => item.id === paperPublishMatch.params.paperId);
    if (!paper) throw new HttpError(404, "Paper was not found.");

    paper.status = "published";
    paper.updatedAt = nowIso();
    await writeStore(store);
    json(response, 200, { paper });
    return true;
  }

  if (paperMatch && request.method === "DELETE") {
    requireAdmin(context);
    const store = await readStore();
    const paper = store.papers.find((item) => item.id === paperMatch.params.paperId);
    if (!paper) throw new HttpError(404, "Paper was not found.");
    const lessonIds = store.lessons
      .filter((lesson) => lesson.paperId === paper.id)
      .map((lesson) => lesson.id);
    const sceneIds = store.scenes
      .filter((scene) => lessonIds.includes(scene.lessonId))
      .map((scene) => scene.id);

    store.papers = store.papers.filter((item) => item.id !== paper.id);
    store.lessons = store.lessons.filter((lesson) => lesson.paperId !== paper.id);
    store.scenes = store.scenes.filter((scene) => !sceneIds.includes(scene.id));
    store.blocks = store.blocks.filter((block) => !sceneIds.includes(block.sceneId));
    store.workspaces = store.workspaces.filter((workspace) => workspace.paperId !== paper.id);
    store.narration = store.narration.filter((audio) => !lessonIds.includes(audio.lessonId));
    store.progress = store.progress.filter((progress) => !lessonIds.includes(progress.lessonId));
    await writeStore(store);
    noContent(response);
    return true;
  }

  const paperLessonsMatch = matchPath("/api/papers/:paperId/lessons", path);
  if (paperLessonsMatch && request.method === "GET") {
    const user = requireUser(context);
    const store = await readStore();
    const paper = store.papers.find((item) => item.id === paperLessonsMatch.params.paperId);
    if (!paper) throw new HttpError(404, "Paper was not found.");
    const subject = store.subjects.find((item) => item.id === paper.subjectId);

    if (
      user.role !== "admin" &&
      (!subject ||
        subject.status !== "published" ||
        paper.status !== "published" ||
        !canAccessSubject(subject, user.id, store.subjectAccess))
    ) {
      throw new HttpError(403, "Subscribe or start a trial to access this paper.");
    }

    const lessons = store.lessons
      .filter((lesson) => {
        if (lesson.paperId !== paper.id) return false;
        return user.role === "admin" || lesson.status === "published";
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.createdAt.localeCompare(b.createdAt));
    json(response, 200, { lessons });
    return true;
  }

  if (paperLessonsMatch && request.method === "POST") {
    requireAdmin(context);
    const body = await readJson<Partial<Lesson>>(request);
    const store = await readStore();
    const paper = store.papers.find((item) => item.id === paperLessonsMatch.params.paperId);
    if (!paper) throw new HttpError(404, "Paper was not found.");
    const lesson: Lesson = {
      id: randomUUID(),
      subjectId: paper.subjectId,
      paperId: paper.id,
      title: body.title ?? "Untitled lesson",
      description: body.description ?? "",
      status: body.status ?? "draft",
      estimatedMinutes: body.estimatedMinutes ?? 10,
      order: body.order ?? store.lessons.filter((item) => item.paperId === paper.id).length + 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.lessons.push(lesson);
    await writeStore(store);
    json(response, 201, { lesson });
    return true;
  }

  const subjectLessonsMatch = matchPath("/api/subjects/:subjectId/lessons", path);
  if (subjectLessonsMatch && request.method === "GET") {
    const user = requireUser(context);
    const store = await readStore();
    const subject = store.subjects.find(
      (item) => item.id === subjectLessonsMatch.params.subjectId,
    );

    if (
      user.role !== "admin" &&
      (!subject || !canAccessSubject(subject, user.id, store.subjectAccess))
    ) {
      throw new HttpError(403, "Subscribe or start a trial to access this subject.");
    }

    const lessons = store.lessons.filter((item) => item.subjectId === subjectLessonsMatch.params.subjectId);
    json(response, 200, { lessons });
    return true;
  }

  if (subjectLessonsMatch && request.method === "POST") {
    requireAdmin(context);
    const body = await readJson<Partial<Lesson>>(request);
    const store = await readStore();
    const paper = store.papers.find((item) => item.subjectId === subjectLessonsMatch.params.subjectId);
    if (!paper) throw new HttpError(400, "Create a paper before adding lessons.");
    const lesson: Lesson = {
      id: randomUUID(),
      subjectId: subjectLessonsMatch.params.subjectId,
      paperId: paper.id,
      title: body.title ?? "Untitled lesson",
      description: body.description ?? "",
      status: "draft",
      estimatedMinutes: body.estimatedMinutes ?? 10,
      order: body.order ?? store.lessons.filter((item) => item.paperId === paper.id).length + 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.lessons.push(lesson);
    await writeStore(store);
    json(response, 201, { lesson });
    return true;
  }

  const lessonMatch = matchPath("/api/lessons/:lessonId", path);
  if (lessonMatch && request.method === "GET") {
    const user = requireUser(context);
    const store = await readStore();
    const lesson = store.lessons.find((item) => item.id === lessonMatch.params.lessonId);
    if (!lesson) throw new HttpError(404, "Lesson was not found.");
    const subject = store.subjects.find((item) => item.id === lesson.subjectId);

    if (
      user.role !== "admin" &&
      (!subject || !canAccessSubject(subject, user.id, store.subjectAccess))
    ) {
      throw new HttpError(403, "Subscribe or start a trial to access this lesson.");
    }

    json(response, 200, {
      lesson,
      scenes: store.scenes.filter((scene) => {
        if (scene.lessonId !== lesson.id) return false;
        return user.role === "admin" || scene.status === "published";
      }).sort((a, b) => a.order - b.order),
      blocks: store.blocks.filter((block) => store.scenes.some((scene) => {
        if (scene.lessonId !== lesson.id || scene.id !== block.sceneId) return false;
        return user.role === "admin" || scene.status === "published";
      })).sort((a, b) => a.order - b.order),
      narration: store.narration.filter((audio) => audio.lessonId === lesson.id),
    });
    return true;
  }

  if (lessonMatch && request.method === "PATCH") {
    requireAdmin(context);
    const body = await readJson<Partial<Lesson>>(request);
    const store = await readStore();
    const lesson = store.lessons.find((item) => item.id === lessonMatch.params.lessonId);
    if (!lesson) throw new HttpError(404, "Lesson was not found.");
    Object.assign(lesson, { ...body, id: lesson.id, subjectId: lesson.subjectId, paperId: lesson.paperId, updatedAt: nowIso() });
    await writeStore(store);
    json(response, 200, { lesson });
    return true;
  }

  if (lessonMatch && request.method === "DELETE") {
    requireAdmin(context);
    const store = await readStore();
    const lesson = store.lessons.find((item) => item.id === lessonMatch.params.lessonId);
    if (!lesson) throw new HttpError(404, "Lesson was not found.");
    const sceneIds = store.scenes
      .filter((scene) => scene.lessonId === lesson.id)
      .map((scene) => scene.id);

    store.lessons = store.lessons.filter((item) => item.id !== lesson.id);
    store.scenes = store.scenes.filter((scene) => scene.lessonId !== lesson.id);
    store.blocks = store.blocks.filter((block) => !sceneIds.includes(block.sceneId));
    store.narration = store.narration.filter((audio) => audio.lessonId !== lesson.id);
    store.progress = store.progress.filter((progress) => progress.lessonId !== lesson.id);
    await writeStore(store);
    noContent(response);
    return true;
  }

  const publishMatch = matchPath("/api/lessons/:lessonId/publish", path);
  if (publishMatch && request.method === "POST") {
    requireAdmin(context);
    const store = await readStore();
    const lesson = store.lessons.find((item) => item.id === publishMatch.params.lessonId);
    if (!lesson) throw new HttpError(404, "Lesson was not found.");
    lesson.status = "published";
    lesson.updatedAt = nowIso();
    await writeStore(store);
    json(response, 200, { lesson });
    return true;
  }

  const lessonScenesMatch = matchPath("/api/lessons/:lessonId/scenes", path);
  if (lessonScenesMatch && request.method === "POST") {
    requireAdmin(context);
    const body = await readJson<Partial<Scene>>(request);
    const store = await readStore();
    const scene: Scene = {
      id: randomUUID(),
      lessonId: lessonScenesMatch.params.lessonId,
      title: body.title ?? "Untitled scene",
      type: body.type ?? "concept",
      status: body.status ?? "draft",
      order: body.order ?? store.scenes.filter((item) => item.lessonId === lessonScenesMatch.params.lessonId).length + 1,
      durationSeconds: body.durationSeconds ?? 45,
      animation: body.animation ?? "fade",
      background: body.background ?? "#F8FBFF",
      narrationAudioId: body.narrationAudioId,
    };
    store.scenes.push(scene);
    await writeStore(store);
    json(response, 201, { scene });
    return true;
  }

  const sceneMatch = matchPath("/api/scenes/:sceneId", path);
  if (sceneMatch && request.method === "PATCH") {
    requireAdmin(context);
    const body = await readJson<Partial<Scene>>(request);
    const store = await readStore();
    const scene = store.scenes.find((item) => item.id === sceneMatch.params.sceneId);
    if (!scene) throw new HttpError(404, "Scene was not found.");
    Object.assign(scene, { ...body, id: scene.id, lessonId: scene.lessonId });
    await writeStore(store);
    json(response, 200, { scene });
    return true;
  }

  if (sceneMatch && request.method === "DELETE") {
    requireAdmin(context);
    const store = await readStore();
    store.scenes = store.scenes.filter((item) => item.id !== sceneMatch.params.sceneId);
    store.blocks = store.blocks.filter((item) => item.sceneId !== sceneMatch.params.sceneId);
    await writeStore(store);
    noContent(response);
    return true;
  }

  const sceneBlocksMatch = matchPath("/api/scenes/:sceneId/blocks", path);
  if (sceneBlocksMatch && request.method === "POST") {
    requireAdmin(context);
    const body = await readJson<Partial<SceneBlock>>(request);
    const store = await readStore();
    const block: SceneBlock = {
      id: randomUUID(),
      sceneId: sceneBlocksMatch.params.sceneId,
      type: body.type ?? "paragraph",
      content: body.content ?? "",
      items: body.items,
      listKind: body.listKind,
      language: body.language,
      alignX: body.alignX ?? "center",
      alignY: body.alignY ?? "middle",
      stepIndex: body.stepIndex ?? 1,
      startTime: body.startTime ?? 0,
      duration: body.duration ?? 8,
      animation: body.animation ?? "fade",
      order: body.order ?? store.blocks.filter((item) => item.sceneId === sceneBlocksMatch.params.sceneId).length + 1,
    };
    store.blocks.push(block);
    await writeStore(store);
    json(response, 201, { block });
    return true;
  }

  const blockMatch = matchPath("/api/blocks/:blockId", path);
  if (blockMatch && request.method === "PATCH") {
    requireAdmin(context);
    const body = await readJson<Partial<SceneBlock>>(request);
    const store = await readStore();
    const block = store.blocks.find((item) => item.id === blockMatch.params.blockId);
    if (!block) throw new HttpError(404, "Block was not found.");
    Object.assign(block, { ...body, id: block.id, sceneId: block.sceneId });
    await writeStore(store);
    json(response, 200, { block });
    return true;
  }

  if (blockMatch && request.method === "DELETE") {
    requireAdmin(context);
    const store = await readStore();
    store.blocks = store.blocks.filter((item) => item.id !== blockMatch.params.blockId);
    await writeStore(store);
    noContent(response);
    return true;
  }

  return false;
}

interface WorkspaceBlock {
  id: string;
  type?: string;
  content?: string | string[];
  stepIndex?: number;
  startTime?: number;
  duration?: number;
  animation?: SceneAnimation | "typewriter" | "word-reveal" | "stagger-lines" | "draw-emphasis" | "draw";
  layout?: {
    align?: "left" | "center" | "right" | "full";
  };
  style?: {
    align?: "left" | "center" | "right";
  };
}

interface WorkspaceScene {
  id: string;
  title: string;
  type?: Scene["type"] | "exam-extract";
  summary?: string;
  status?: PublishStatus;
  order?: number;
  blocks?: WorkspaceBlock[];
  design?: {
    backgroundColor?: string;
    horizontalAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "center" | "bottom";
  };
}

interface WorkspaceLesson {
  id: string;
  title: string;
  status?: PublishStatus;
  scenes?: WorkspaceScene[];
}

interface WorkspaceSubtopic {
  lessons?: WorkspaceLesson[];
}

interface WorkspaceTopic {
  subtopics?: WorkspaceSubtopic[];
}

interface WorkspaceDraft {
  subjectId: string;
  paperId: string;
  updatedAt?: string;
  subjectMeta?: {
    title?: string;
    code?: string;
    description?: string;
    status?: PublishStatus;
  };
  paperMeta?: {
    title?: string;
    description?: string;
    estimatedMinutes?: number;
    status?: PublishStatus;
  };
  topics?: WorkspaceTopic[];
}

function saveWorkspaceDraft(
  store: StoreData,
  subject: Subject,
  paper: Paper,
  draft: WorkspaceDraft,
) {
  const updatedAt = nowIso();
  const workspace = store.workspaces.find((item) => item.paperId === paper.id);
  if (workspace) {
    workspace.draft = draft;
    workspace.updatedAt = updatedAt;
  } else {
    store.workspaces.push({
      id: randomUUID(),
      subjectId: subject.id,
      paperId: paper.id,
      draft,
      createdAt: updatedAt,
      updatedAt,
    });
  }

  if (draft.subjectMeta) {
    subject.name = draft.subjectMeta.title ?? subject.name;
    subject.code = draft.subjectMeta.code ?? subject.code;
    subject.description = draft.subjectMeta.description ?? subject.description;
    subject.status = draft.subjectMeta.status ?? subject.status;
    subject.updatedAt = updatedAt;
  }

  if (draft.paperMeta) {
    paper.title = draft.paperMeta.title ?? paper.title;
    paper.description = draft.paperMeta.description ?? paper.description;
    paper.estimatedTime = formatEstimatedTime(draft.paperMeta.estimatedMinutes);
    paper.status = draft.paperMeta.status ?? paper.status;
    paper.updatedAt = updatedAt;
  }

  const previousLessons = store.lessons.filter((lesson) => lesson.paperId === paper.id);
  const previousLessonIds = previousLessons.map((lesson) => lesson.id);
  const previousSceneIds = store.scenes
    .filter((scene) => previousLessonIds.includes(scene.lessonId))
    .map((scene) => scene.id);
  const flattenedLessons = flattenWorkspaceLessons(draft);
  const nextLessonIds = flattenedLessons.map((lesson) => lesson.id);
  const nextScenes = flattenedLessons.flatMap((lesson) => lesson.scenes);
  const nextSceneIds = nextScenes.map((scene) => scene.id);

  store.lessons = [
    ...store.lessons.filter((lesson) => lesson.paperId !== paper.id),
    ...flattenedLessons.map((lesson, index): Lesson => ({
      id: lesson.id,
      subjectId: subject.id,
      paperId: paper.id,
      title: lesson.title || `Lesson ${index + 1}`,
      description: firstSceneSummary(lesson),
      status: normalizeStatus(lesson.status),
      estimatedMinutes: estimateLessonMinutes(lesson),
      order: index + 1,
      createdAt:
        previousLessons.find((item) => item.id === lesson.id)?.createdAt ??
        updatedAt,
      updatedAt,
    })),
  ];

  store.scenes = [
    ...store.scenes.filter((scene) => !previousLessonIds.includes(scene.lessonId)),
    ...nextScenes.map(({ lessonId, scene }, index): Scene => ({
      id: scene.id,
      lessonId,
      title: scene.title || `Scene ${index + 1}`,
      type: normalizeSceneType(scene.type),
      status: normalizeStatus(scene.status),
      order: scene.order ?? index + 1,
      durationSeconds: estimateSceneSeconds(scene),
      animation: normalizeAnimation(scene.blocks?.[0]?.animation),
      background: scene.design?.backgroundColor ?? "#F8FBFF",
    })),
  ];

  store.blocks = [
    ...store.blocks.filter((block) => !previousSceneIds.includes(block.sceneId)),
    ...nextScenes.flatMap(({ scene }) =>
      (scene.blocks ?? []).map((block, index): SceneBlock => {
        const normalized = normalizeBlock(block);
        return {
          id: block.id || randomUUID(),
          sceneId: scene.id,
          type: normalized.type,
          content: normalized.content,
          items: normalized.items,
          listKind: normalized.listKind,
          language: normalized.language,
          alignX: normalizeAlignX(block.layout?.align ?? block.style?.align),
          alignY: normalizeAlignY(scene.design?.verticalAlign),
          stepIndex: block.stepIndex ?? index + 1,
          startTime: block.startTime ?? 0,
          duration: block.duration ?? 8,
          animation: normalizeAnimation(block.animation),
          order: index + 1,
        };
      }),
    ),
  ];

  store.narration = store.narration.filter((audio) => nextLessonIds.includes(audio.lessonId));
  store.progress = store.progress.filter((progress) => nextLessonIds.includes(progress.lessonId));
}

function flattenWorkspaceLessons(draft: WorkspaceDraft) {
  return (draft.topics ?? []).flatMap((topic) =>
    (topic.subtopics ?? []).flatMap((subtopic) =>
      (subtopic.lessons ?? []).map((lesson) => ({
        ...lesson,
        scenes: lesson.scenes ?? [],
      })),
    ),
  );
}

function firstSceneSummary(lesson: WorkspaceLesson) {
  return lesson.scenes?.[0]?.summary ?? lesson.scenes?.[0]?.title ?? "";
}

function estimateLessonMinutes(lesson: WorkspaceLesson) {
  const seconds =
    lesson.scenes?.reduce((total, scene) => total + estimateSceneSeconds(scene), 0) ?? 0;
  return Math.max(1, Math.ceil(seconds / 60));
}

function estimateSceneSeconds(scene: WorkspaceScene) {
  const blockEnd = (scene.blocks ?? []).reduce(
    (max, block) => Math.max(max, (block.startTime ?? 0) + (block.duration ?? 0)),
    0,
  );
  return Math.max(30, blockEnd);
}

function formatEstimatedTime(minutes?: number) {
  if (!minutes || minutes <= 0) return "To be planned";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} min`;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function normalizeStatus(status?: PublishStatus): PublishStatus {
  return status ?? "draft";
}

function normalizeSceneType(type?: WorkspaceScene["type"]): Scene["type"] {
  if (type === "diagram" || type === "example" || type === "checkpoint" || type === "exam-extract") {
    return type;
  }
  return "concept";
}

function normalizeAnimation(animation?: WorkspaceBlock["animation"]): SceneAnimation {
  if (animation === "none" || animation === "slide-up" || animation === "zoom") {
    return animation;
  }
  return "fade";
}

function normalizeAlignX(align?: "left" | "center" | "right" | "full") {
  if (align === "left" || align === "right") return align;
  return "center";
}

function normalizeAlignY(align?: "top" | "center" | "bottom") {
  if (align === "top" || align === "bottom") return align;
  return "middle";
}

function normalizeBlock(block: WorkspaceBlock): {
  type: SceneBlockType;
  content: string;
  items?: string[];
  listKind?: "bullet" | "numbered";
  language?: "pseudocode" | "python" | "javascript" | "plain";
} {
  const rawItems = Array.isArray(block.content)
    ? block.content.map(String).filter(Boolean)
    : typeof block.content === "string"
      ? block.content.split("\n").map((item) => item.trim()).filter(Boolean)
      : [];
  const content =
    typeof block.content === "string"
      ? block.content
      : rawItems.join("\n");

  if (block.type === "list" || block.type === "numbered-list") {
    return {
      type: "list",
      content: "",
      items: rawItems,
      listKind: block.type === "numbered-list" ? "numbered" : "bullet",
    };
  }

  if (block.type === "callout" || block.type === "keyIdea") {
    return { type: "keyIdea", content };
  }

  if (block.type === "quote") return { type: "quote", content };
  if (block.type === "code") {
    return { type: "code", content, language: "pseudocode" };
  }

  return { type: "paragraph", content };
}

function canAccessSubject(
  subject: Subject,
  studentId: string,
  accessList: SubjectAccess[],
) {
  if (subject.isFree) return true;

  const access = accessList.find(
    (item) => item.studentId === studentId && item.subjectId === subject.id,
  );

  if (!access) return false;

  const trialExpired =
    access.status === "trialing" &&
    access.trialEndsAt &&
    new Date(access.trialEndsAt).getTime() < Date.now();
  const activeExpired =
    access.status === "active" &&
    access.currentPeriodEndsAt &&
    new Date(access.currentPeriodEndsAt).getTime() < Date.now();

  if (trialExpired || activeExpired) return false;

  return access.status === "trialing" || access.status === "active";
}

function createPaperStarterContent(
  store: StoreData,
  subject: Subject,
  paper: Paper,
) {
  const lesson: Lesson = {
    id: randomUUID(),
    subjectId: subject.id,
    paperId: paper.id,
    title: "Welcome lesson",
    description:
      "Starter lesson with intro, concept, example, and checkpoint scenes.",
    status: "draft",
    estimatedMinutes: 12,
    order: 1,
    createdAt: paper.createdAt,
    updatedAt: paper.updatedAt,
  };
  const scenes: Scene[] = [
    {
      id: randomUUID(),
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
      id: randomUUID(),
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
      id: randomUUID(),
      lessonId: lesson.id,
      title: "Example scene",
      type: "example",
      status: "draft",
      order: 3,
      durationSeconds: 45,
      animation: "fade",
      background: "#FFFFFF",
    },
    {
      id: randomUUID(),
      lessonId: lesson.id,
      title: "Embedded checkpoint scene",
      type: "checkpoint",
      status: "draft",
      order: 4,
      durationSeconds: 35,
      animation: "fade",
      background: "#EEF5FF",
    },
  ];
  const blocks: SceneBlock[] = scenes.map((scene, index) => ({
    id: randomUUID(),
    sceneId: scene.id,
    type: index === 1 ? "list" : index === 2 ? "keyIdea" : "paragraph",
    content:
      index === 0
        ? "Introduce the lesson and tell the learner what they will be able to do."
        : index === 1
          ? "Explain the core idea with 2-3 clean points."
          : index === 2
            ? "Model one worked example before asking the learner to try."
            : "Ask a quick checkpoint question before continuing.",
    items:
      index === 1
        ? ["Define the concept", "Show the pattern", "Connect it to an exam skill"]
        : undefined,
    listKind: index === 1 ? "bullet" : undefined,
    alignX: "center",
    alignY: "middle",
    stepIndex: 1,
    startTime: 0,
    duration: 8,
    animation: "fade",
    order: 1,
  }));

  store.lessons.push(lesson);
  store.scenes.push(...scenes);
  store.blocks.push(...blocks);
}
