import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db, pool } from "./client.js";
import { lessonComponents, lessons, papers, subjects, topics } from "./schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEARN_DATA_PATH = path.join(__dirname, "../../data/learn");

interface LearnSubject {
  id: string;
  title: string;
  code: string;
  papers: string[];
}

interface LessonSlide {
  id: string;
  type: string;
  title: string;
  duration?: number;
  blocks?: Array<any>;
  problem?: string;
  code?: string;
  explanation?: string;
  task?: string;
  marks?: number;
  expectedAnswer?: string;
  markScheme?: Array<any>;
  startsBlock?: boolean;
  [key: string]: any;
}

interface JsonLesson {
  id: string;
  title: string;
  slides: LessonSlide[];
}

interface JsonSection {
  section?: string;
  title: string;
  lessons: JsonLesson[];
}

async function getSubjectLevel(subjectId: string): Promise<"A Level" | "IGCSE"> {
  const subjectJsonPath = path.join(LEARN_DATA_PATH, subjectId, "subject.json");
  if (fs.existsSync(subjectJsonPath)) {
    const content = fs.readFileSync(subjectJsonPath, "utf-8");
    const subjectData = JSON.parse(content) as LearnSubject;
    if (subjectData.title.includes("A Level")) return "A Level";
    if (subjectData.title.includes("IGCSE")) return "IGCSE";
  }
  return "A Level";
}

async function seedFromJson() {
  try {
    console.log("Starting JSON seed...");

    // Get all subject directories
    const learnDataDir = LEARN_DATA_PATH;
    if (!fs.existsSync(learnDataDir)) {
      console.log("Learn data directory not found, skipping JSON seed");
      return;
    }

    const subjectDirs = fs
      .readdirSync(learnDataDir)
      .filter((file) => {
        const stat = fs.statSync(path.join(learnDataDir, file));
        return stat.isDirectory();
      });

    for (const subjectId of subjectDirs) {
      console.log(`\nProcessing subject: ${subjectId}`);

      const level = await getSubjectLevel(subjectId);
      const subjectJsonPath = path.join(learnDataDir, subjectId, "subject.json");

      if (!fs.existsSync(subjectJsonPath)) {
        console.log(`  No subject.json found, skipping`);
        continue;
      }

      const subjectJsonContent = fs.readFileSync(subjectJsonPath, "utf-8");
      const subjectData = JSON.parse(subjectJsonContent) as LearnSubject;

      // Upsert subject with level
      await db
        .insert(subjects)
        .values({
          id: subjectData.id,
          code: subjectData.code,
          name: subjectData.title,
          description: `${subjectData.title} (${subjectData.code})`,
          level,
          status: "active",
        })
        .onConflictDoUpdate({
          target: subjects.id,
          set: { level, status: "active" },
        });

      console.log(`  ✓ Subject: ${subjectData.title} (Level: ${level})`);

      // Process papers
      let paperPosition = 0;
      for (const paperNum of subjectData.papers) {
        const paperDirName = `Paper ${paperNum}`;
        const paperPath = path.join(learnDataDir, subjectId, paperDirName);

        if (!fs.existsSync(paperPath)) {
          console.log(`    Skipping Paper ${paperNum} (not found)`);
          continue;
        }

        const paperId = `${subjectId}-paper-${paperNum}`;

        // Insert or update paper
        await db
          .insert(papers)
          .values({
            id: paperId,
            subjectId: subjectData.id,
            title: `Paper ${paperNum}`,
            description: `Paper ${paperNum}`,
            position: paperPosition,
          })
          .onConflictDoUpdate({
            target: papers.id,
            set: { position: paperPosition },
          });

        console.log(`    ✓ Paper ${paperNum}`);

        // Process topics (subdirectories in paper folder)
        const topicDirs = fs
          .readdirSync(paperPath)
          .filter((file) => {
            const stat = fs.statSync(path.join(paperPath, file));
            return stat.isDirectory();
          })
          .sort();

        let topicPosition = 0;
        for (const topicDir of topicDirs) {
          const topicPath = path.join(paperPath, topicDir);
          const topicId = `${subjectId}-paper-${paperNum}-topic-${topicPosition}`;

          // Extract topic name from directory (remove leading number)
          const topicName = topicDir.replace(/^\d+\.\s+/, "");

          // Insert or update topic
          await db
            .insert(topics)
            .values({
              id: topicId,
              paperId: paperId,
              title: topicName,
              position: topicPosition,
            })
            .onConflictDoUpdate({
              target: topics.id,
              set: { title: topicName, position: topicPosition },
            });

          console.log(`      ✓ Topic: ${topicName}`);

          // Process JSON files in topic folder (Learn.json, Practice.json, Checkpoint.json)
          const jsonFiles = ["Learn.json", "Practice.json", "Checkpoint.json"];

          for (const jsonFile of jsonFiles) {
            const jsonPath = path.join(topicPath, jsonFile);
            if (!fs.existsSync(jsonPath)) continue;

            try {
              const jsonContent = fs.readFileSync(jsonPath, "utf-8");
              const sectionData = JSON.parse(jsonContent) as JsonSection;

              if (!sectionData.lessons || sectionData.lessons.length === 0) {
                continue;
              }

              const sectionName = sectionData.section ?? sectionData.title ?? jsonFile.replace(".json", "");

            let lessonPosition = 0;
            for (const lessonData of sectionData.lessons) {
              const lessonId = `${topicId}-${lessonData.id}`;
              const lessonSlug = lessonData.id;

              // Insert or update lesson
              await db
                .insert(lessons)
                .values({
                  id: lessonId,
                  topicId: topicId,
                  title: lessonData.title,
                  slug: lessonSlug,
                  description: `${sectionName}: ${lessonData.title}`,
                  position: lessonPosition,
                })
                .onConflictDoUpdate({
                  target: lessons.id,
                  set: {
                    title: lessonData.title,
                    description: `${sectionName}: ${lessonData.title}`,
                    position: lessonPosition,
                  },
                });

              // Process slides as lesson components
              let componentPosition = 0;
              for (const slide of lessonData.slides) {
                const componentId = `${lessonId}-${slide.id}`;
                let componentType = slide.type || "concept";
                
                // Normalize component type: tryit -> try_it
                if (componentType === "tryit") {
                  componentType = "try_it";
                }
                
                const validTypes = ["concept", "example", "try_it", "practice", "checkpoint"];
                if (!validTypes.includes(componentType)) {
                  componentType = "concept";
                }

                const componentContent = {
                  title: slide.title,
                  duration: slide.duration,
                  blocks: slide.blocks || [],
                  problem: slide.problem,
                  code: slide.code,
                  explanation: slide.explanation,
                  task: slide.task,
                  marks: slide.marks,
                  expectedAnswer: slide.expectedAnswer,
                  markScheme: slide.markScheme,
                  startsBlock: slide.startsBlock,
                };

                // Insert or update lesson component
                await db
                  .insert(lessonComponents)
                  .values({
                    id: componentId,
                    lessonId: lessonId,
                    type: componentType as "concept" | "example" | "try_it" | "practice" | "checkpoint",
                    content: componentContent,
                    position: componentPosition,
                  })
                  .onConflictDoUpdate({
                    target: lessonComponents.id,
                    set: {
                      content: componentContent,
                      position: componentPosition,
                    },
                  });

                componentPosition++;
              }

              lessonPosition++;
            }
            } catch (error) {
              console.log(`      ⚠ Error reading ${jsonFile}: ${error instanceof Error ? error.message : String(error)}`);
              continue;
            }
          }

          topicPosition++;
        }

        paperPosition++;
      }
    }

    console.log("\n✅ JSON seed completed successfully!");
  } catch (error) {
    console.error("Error during JSON seed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedFromJson().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
