export type AdminSceneType =
  | "concept"
  | "example"
  | "diagram"
  | "code"
  | "checkpoint"
  | "exam-extract";

export interface AdminSceneBlock {
  id: string;
  type: string;
  content: string | string[];
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    italic?: boolean;
    underline?: boolean;
    align?: "left" | "center" | "right";
    color?: string;
    lineHeight?: number;
    letterSpacing?: number;
    effect?:
      | "none"
      | "highlight"
      | "shadow"
      | "outline"
      | "accent-bar"
      | "soft-card"
      | "glow"
      | "lift";
  };
  stepIndex: number;
  startTime: number;
  duration: number;
  animation?:
    | "none"
    | "fade"
    | "slide-up"
    | "zoom"
    | "typewriter"
    | "word-reveal"
    | "stagger-lines"
    | "draw-emphasis"
    | "draw";
  layout?: {
    align?: "left" | "center" | "right" | "full";
    width?: "sm" | "md" | "lg" | "full";
  };
}

export interface AdminSceneStepGroup {
  stepIndex: number;
  title: string;
}

export interface AdminSceneDesign {
  background?: "white" | "soft-blue" | "dark-lecture" | "gradient" | "mesh";
  backgroundColor?: string;
  accentColor?: string;
  textColor?: string;
  layout?: "centered" | "split" | "hero" | "stacked" | "formula" | "comparison";
  theme?: "modern-learning" | "scientific" | "minimal" | "exam-mode";
  radius?: number;
  shadow?: "none" | "soft" | "deep";
  spacing?: "compact" | "comfortable" | "spacious";
  horizontalAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "center" | "bottom";
}

export interface AdminSceneTransition {
  type?: "fade" | "slide" | "zoom" | "crossfade";
  duration?: number;
}

export interface AdminSceneDraft {
  id: string;
  title: string;
  type: AdminSceneType;
  summary: string;
  status: "draft" | "published" | "archived";
  order: number;
  durationMinutes?: number;
  blocks?: AdminSceneBlock[];
  stepGroups?: AdminSceneStepGroup[];
  design?: AdminSceneDesign;
  transition?: AdminSceneTransition;
  voiceover?: AdminVoiceoverDraft;
  assessment?: AdminAssessmentDraft;
}

export interface AdminLessonDraft {
  id: string;
  title: string;
  status: "draft" | "published" | "archived";
  scenes: AdminSceneDraft[];
}

export type AdminAnswerKind =
  | "short"
  | "long"
  | "gap"
  | "working"
  | "code"
  | "table"
  | "label"
  | "tick"
  | "multi_tick"
  | "true_false"
  | "match"
  | "order"
  | "classify"
  | "diagram";

export interface AdminAnswerSlotDraft {
  id: string;
  kind: AdminAnswerKind;
  label: string;
  lines?: number;
  placeholder?: string;
  columns?: string[];
  rows?: number;
  options?: string[];
  optionColumns?: string[];
  leftItems?: string[];
  rightItems?: string[];
  items?: string[];
  categories?: string[];
}

export interface AdminMarkPointDraft {
  id: string;
  text: string;
  marks: number;
  keywords?: string[];
  acceptedAlternatives?: string[];
  topic?: string;
  requiresEvidence?: boolean;
}

export interface AdminAssessmentPartDraft {
  id: string;
  label: string;
  prompt: string;
  marks: number;
  answerSlots: AdminAnswerSlotDraft[];
  markScheme: AdminMarkPointDraft[];
  guidance?: string;
  expectedAnswer?: string;
  difficulty?: "easy" | "medium" | "hard";
  subparts?: AdminAssessmentPartDraft[];
  tags?: string[];
  topic?: string;
}

export interface AdminAssessmentQuestionDraft {
  id: string;
  number: number;
  title: string;
  source?: {
    paper?: string;
    session?: string;
    questionRef?: string;
  };
  context?: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  parts: AdminAssessmentPartDraft[];
}

export interface AdminAssessmentDraft {
  id: string;
  title: string;
  scope: "embedded" | "topical" | "module";
  description?: string;
  durationMinutes?: number;
  unlock?: {
    markScheme: "immediate" | "after_submit" | "teacher_only";
    expectedAnswer: "immediate" | "after_submit" | "teacher_only";
  };
  questions: AdminAssessmentQuestionDraft[];
}

export interface AdminSubtopicDraft {
  id: string;
  title: string;
  status?: "draft" | "published" | "archived";
  lessons: AdminLessonDraft[];
}

export interface AdminTopicDraft {
  id: string;
  title: string;
  status?: "draft" | "published" | "archived";
  subtopics: AdminSubtopicDraft[];
  topicalAssessmentTitle: string;
  topicalAssessment?: AdminAssessmentDraft;
}

export interface AdminPaperDraft {
  subjectId: string;
  paperId: string;
  updatedAt: string;
  moduleAssessmentTitle: string;
  moduleAssessment?: AdminAssessmentDraft;
  subjectMeta?: {
    title: string;
    code: string;
    description: string;
    learningOutcomes: string[];
    skills: string[];
    status: "draft" | "published" | "archived";
  };
  paperMeta?: {
    title: string;
    description: string;
    learningOutcomes: string[];
    skills: string[];
    estimatedMinutes: number;
    status: "draft" | "published" | "archived";
  };
  ui?: {
    activeLessonId?: string;
    activeSceneId?: string;
    expandedTopicIds?: string[];
    selectedTopicId?: string;
  };
  topics: AdminTopicDraft[];
}

export interface CreateSceneInput {
  title: string;
  type: AdminSceneType;
  summary: string;
  lessonId?: string;
  durationMinutes?: number;
}

export type AdminVoiceoverDraft = {
  mode: "uploaded" | "recorded" | "generated";
  script: string;
  speed: number;
  audioUrl?: string;
  durationSeconds?: number;
  provider?: "browser" | "elevenlabs" | "openai";
  voiceId?: string;
  captionsEnabled: boolean;
  originalAudioUrl?: string;
  cleanedAudioUrl?: string;
  processingStatus?: "idle" | "processing" | "completed";
  captions?: {
    start: number;
    end: number;
    text: string;
  }[];
};
