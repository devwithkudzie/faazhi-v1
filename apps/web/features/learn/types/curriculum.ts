import type { Scene } from "./scene";
import type { AdminAssessmentDraft } from "@/features/admin/papers/types/paper-workspace.types";

export type LessonState = "completed" | "current" | "locked" | "available";

export type LessonNode = {
  id: string;
  title: string;
  kind: "reading" | "lesson";
  durationLabel: string;
  state: LessonState;
  scenes: Scene[];
};

export type TopicalAssessment = {
  id: string;
  title: string;
  durationLabel: string;
  state: "available" | "locked" | "completed";
  assessment?: AdminAssessmentDraft;
};

export type TopicNode = {
  id: string;
  title: string;
  lessonCount: number;
  lessons: LessonNode[];
  topicalAssessment: TopicalAssessment;
};

export type ModuleAssessment = {
  id: string;
  title: string;
  durationLabel: string;
  state: "available" | "locked" | "completed";
  assessment?: AdminAssessmentDraft;
};

export type LearnCurriculum = {
  subjectId: string;
  subjectTitle: string;
  moduleId: string;
  moduleTitle: string;
  progress: number;
  topics: TopicNode[];
  moduleAssessment: ModuleAssessment;
};
