import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { env } from "../config/env.js";
import { seedData } from "../db/seed-data.js";
import type { StoreData } from "../domain/types.js";

const storePath = path.join(env.dataDir, "store.json");

let cache: StoreData | null = null;

export async function readStore(): Promise<StoreData> {
  if (cache) return cache;

  await mkdir(env.dataDir, { recursive: true });

  try {
    const raw = await readFile(storePath, "utf8");
    cache = normalizeStore(JSON.parse(raw) as StoreData);
  } catch {
    cache = structuredClone(seedData);
    await writeStore(cache);
  }

  return cache;
}

function normalizeStore(data: StoreData): StoreData {
  data.subjectAccess ??= [];
  data.papers ??= [];
  data.workspaces ??= [];

  data.subjects = data.subjects.map((subject) => ({
    ...subject,
    isFree: subject.isFree ?? subject.id === "9618",
    level: subject.level ?? "a-level",
  }));

  data.papers = data.papers.map((paper) => ({
    ...paper,
    description:
      paper.description ??
      "Paper outline placeholder. Add subject-specific details in the paper workspace.",
    estimatedTime: paper.estimatedTime ?? "To be planned",
  }));

  for (const subject of data.subjects) {
    const hasPaper = data.papers.some((paper) => paper.subjectId === subject.id);
    if (!hasPaper) {
      data.papers.push({
        id: `paper-${subject.id}-1`,
        subjectId: subject.id,
        title: "Paper 1",
        description: "Paper outline placeholder. Add subject-specific details in the paper workspace.",
        estimatedTime: "To be planned",
        status: subject.status,
        order: 1,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
      });
    }
  }

  data.lessons = data.lessons.map((lesson) => ({
    ...lesson,
    status: lesson.status ?? "draft",
    paperId:
      lesson.paperId ??
      data.papers.find((paper) => paper.subjectId === lesson.subjectId)?.id ??
      `paper-${lesson.subjectId}-1`,
  }));

  data.scenes = data.scenes.map((scene) => ({
    ...scene,
    status: scene.status ?? "draft",
  }));

  return data;
}

export async function writeStore(data: StoreData): Promise<void> {
  cache = data;
  await mkdir(env.dataDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(data, null, 2));
}

export async function resetStore(): Promise<StoreData> {
  const data = structuredClone(seedData);
  await writeStore(data);
  return data;
}
