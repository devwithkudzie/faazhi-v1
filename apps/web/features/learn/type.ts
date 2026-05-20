export * from "./types";

export type LessonComponentType =
  | "concept"
  | "example"
  | "try_it"
  | "practice"
  | "checkpoint";

export type LessonBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "keyword";
      label: string;
      text: string;
    };

export type MarkSchemeItem = {
  criterion: string;
  marks: number;
};

export type LessonComponent = {
  id: string;
  type: LessonComponentType;
  title: string;
  duration: number;
  position: number;
  content: {
    title?: string;
    duration?: number;
    blocks?: LessonBlock[];
    problem?: string;
    code?: string;
    explanation?: string;
    task?: string;
    marks?: number;
    expectedAnswer?: string;
    markScheme?: MarkSchemeItem[];
    [key: string]: unknown;
  };
};

export type Lesson = {
  id: string;
  title: string;
  slug: string;
  description: string;
  position: number;
  components: LessonComponent[];
};

export type LessonTopic = {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

export type PaperCourse = {
  id: string;
  subjectId: string;
  paperId: string;
  title: string;
  description: string;
  topics: LessonTopic[];
};
