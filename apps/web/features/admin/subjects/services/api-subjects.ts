import type { AdminSubject } from "@/features/admin/subjects/types/subject.types";

export interface ApiSubject {
  id: string;
  code: string;
  name: string;
  description: string;
  level: "igcse" | "a-level";
  status: "draft" | "published" | "archived";
  isFree: boolean;
}

export function mapApiSubject(subject: ApiSubject): AdminSubject {
  return {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    level: subject.level === "igcse" ? "IGCSE" : "A Level",
    description: subject.description,
    status: subject.status,
    updatedAt: "Updated from API",
    studentCount: 0,
    completionRate: 0,
    lessons: 0,
    assessments: 0,
    averageScore: 0,
    papers: [
      {
        id: "paper-1",
        title: "Paper 1",
        status: subject.status,
        topics: 0,
        scenes: 0,
        completionRate: 0,
      },
    ],
    starterTemplate: [],
  };
}
