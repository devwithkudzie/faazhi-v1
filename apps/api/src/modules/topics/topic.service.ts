import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { topics } from "../../db/schema.js";

export async function listTopics(paperId: string) {
  return db.select().from(topics).where(eq(topics.paperId, paperId)).orderBy(topics.position, topics.title);
}
