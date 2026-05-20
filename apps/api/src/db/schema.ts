import { relations } from "drizzle-orm";
import { integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const subjectStatus = pgEnum("subject_status", ["active", "draft", "archived"]);
export const subjectLevel = pgEnum("subject_level", ["IGCSE", "A Level"]);
export const lessonComponentType = pgEnum("lesson_component_type", ["concept", "example", "try_it", "practice", "checkpoint"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const subjects = pgTable(
  "subjects",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    level: subjectLevel("level").notNull().default("A Level"),
    status: subjectStatus("status").notNull().default("draft"),
    ...timestamps,
  },
  (table) => ({
    codeIdx: uniqueIndex("subjects_code_idx").on(table.code),
  }),
);

export const papers = pgTable("papers", {
  id: text("id").primaryKey(),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  position: integer("position").notNull().default(0),
  ...timestamps,
});

export const topics = pgTable("topics", {
  id: text("id").primaryKey(),
  paperId: text("paper_id")
    .notNull()
    .references(() => papers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: integer("position").notNull().default(0),
  ...timestamps,
});

export const lessons = pgTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (table) => ({
    topicSlugIdx: uniqueIndex("lessons_topic_slug_idx").on(table.topicId, table.slug),
  }),
);

export const lessonComponents = pgTable("lesson_components", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  type: lessonComponentType("type").notNull(),
  content: jsonb("content").notNull().default({}),
  position: integer("position").notNull().default(0),
  ...timestamps,
});

export const subjectsRelations = relations(subjects, ({ many }) => ({
  papers: many(papers),
}));

export const papersRelations = relations(papers, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [papers.subjectId],
    references: [subjects.id],
  }),
  topics: many(topics),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  paper: one(papers, {
    fields: [topics.paperId],
    references: [papers.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  topic: one(topics, {
    fields: [lessons.topicId],
    references: [topics.id],
  }),
  components: many(lessonComponents),
}));

export const lessonComponentsRelations = relations(lessonComponents, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonComponents.lessonId],
    references: [lessons.id],
  }),
}));
