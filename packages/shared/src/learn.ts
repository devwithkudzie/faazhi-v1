import { z } from "zod";

export const subjectStatusSchema = z.enum(["active", "draft", "archived"]);

export const subjectSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  status: subjectStatusSchema.default("draft"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const paperSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  position: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const topicSchema = z.object({
  id: z.string().min(1),
  paperId: z.string().min(1),
  title: z.string().min(1),
  position: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const lessonSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(""),
  position: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const lessonComponentTypeSchema = z.enum(["concept", "example", "try_it", "practice", "checkpoint"]);

export const lessonComponentSchema = z.object({
  id: z.string().min(1),
  lessonId: z.string().min(1),
  type: lessonComponentTypeSchema,
  content: z.record(z.unknown()),
  position: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createSubjectSchema = z.object({
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).optional(),
  status: subjectStatusSchema.optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const createPaperSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).optional(),
});

export const updatePaperSchema = createPaperSchema.partial();

export type SubjectStatus = z.infer<typeof subjectStatusSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type Paper = z.infer<typeof paperSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type LessonComponent = z.infer<typeof lessonComponentSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type CreatePaperInput = z.infer<typeof createPaperSchema>;
export type UpdatePaperInput = z.infer<typeof updatePaperSchema>;
