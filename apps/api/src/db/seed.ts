import "dotenv/config";
import { db, pool } from "./client.js";
import { lessonComponents, lessons, papers, subjects, topics } from "./schema.js";

async function main() {
  await db
    .insert(subjects)
    .values([
      {
        id: "9618",
        code: "9618",
        name: "Computer Science",
        description:
          "Cambridge International AS & A Level Computer Science (9618). Pseudocode, algorithms, databases, networking and more.",
        status: "active",
      },
      {
        id: "9709",
        code: "9709",
        name: "Mathematics",
        description:
          "Cambridge International AS & A Level Mathematics (9709). Pure, mechanics, probability and statistics.",
        status: "draft",
      },
      {
        id: "9702",
        code: "9702",
        name: "Physics",
        description:
          "Cambridge International AS & A Level Physics (9702). Mechanics, electricity, waves and modern physics.",
        status: "draft",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(papers)
    .values([
      {
        id: "1",
        subjectId: "9618",
        title: "Paper 1",
        description: "Paper 1",
        position: 0,
      },
      {
        id: "2",
        subjectId: "9618",
        title: "Paper 2",
        description: "Paper 2",
        position: 1,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(topics)
    .values([
      {
        id: "information-representation",
        paperId: "1",
        title: "Information Representation",
        position: 0,
      },
      {
        id: "starter-topic-paper-2",
        paperId: "2",
        title: "Starter Topic 1",
        position: 0,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(lessons)
    .values([
      {
        id: "information-representation-learn",
        topicId: "information-representation",
        title: "Number Systems and Place Value",
        slug: "information-representation-learn",
        description: "Starter database lesson for Paper 1.",
        position: 0,
      },
      {
        id: "starter-lesson-paper-2",
        topicId: "starter-topic-paper-2",
        title: "Starter Lesson",
        slug: "starter-lesson",
        description: "Starter database lesson for Paper 2.",
        position: 0,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(lessonComponents)
    .values([
      {
        id: "component-paper-1-concept",
        lessonId: "information-representation-learn",
        type: "concept",
        position: 0,
        content: { title: "Concept", body: "Add the first explanation here." },
      },
      {
        id: "component-paper-2-concept",
        lessonId: "starter-lesson-paper-2",
        type: "concept",
        position: 0,
        content: { title: "Concept", body: "Add the first explanation here." },
      },
    ])
    .onConflictDoNothing();

  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
