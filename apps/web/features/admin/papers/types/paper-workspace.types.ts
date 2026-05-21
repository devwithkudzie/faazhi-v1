export type AdminSceneType =
  | "concept"
  | "example"
  | "diagram"
  | "code"
  | "checkpoint"
  | "exam-extract";

export interface AdminSceneDraft {
  id: string;
  title: string;
  type: AdminSceneType;
  summary: string;
  status: "draft";
  order: number;
  voiceover?: AdminVoiceoverDraft;
}

export interface AdminLessonDraft {
  id: string;
  title: string;
  status: "draft" | "published";
  scenes: AdminSceneDraft[];
}

export interface AdminSubtopicDraft {
  id: string;
  title: string;
  lessons: AdminLessonDraft[];
}

export interface AdminTopicDraft {
  id: string;
  title: string;
  subtopics: AdminSubtopicDraft[];
  topicalAssessmentTitle: string;
}

export interface AdminPaperDraft {
  subjectId: string;
  paperId: string;
  updatedAt: string;
  moduleAssessmentTitle: string;
  topics: AdminTopicDraft[];
}

export interface CreateSceneInput {
  title: string;
  type: AdminSceneType;
  summary: string;
}

export type AdminVoiceoverDraft = {
  script: string;
  voiceId: string;
  speed: number;
  captionsEnabled: boolean;
  audioUrl?: string;
  durationSeconds?: number;
  captions?: {
    start: number;
    end: number;
    text: string;
  }[];
};
