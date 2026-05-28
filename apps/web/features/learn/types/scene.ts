export type SceneType =
  | "concept"
  | "example"
  | "diagram"
  | "interactive"
  | "video"
  | "code"
  | "checkpoint"
  | "reflection"
  | "quiz"
  | "simulation"
  | "callout";

export type CaptionSegment = {
  id: string;
  start: number;
  end: number;
  text: string;
};

export type SceneVoiceover = {
  mode: "uploaded" | "recorded" | "generated";
  script: string;
  speed?: number;
  audioUrl?: string;
  durationSeconds?: number;
  provider?: "browser" | "elevenlabs" | "openai";
  voiceId?: string;
  captionsEnabled?: boolean;
  originalAudioUrl?: string;
  cleanedAudioUrl?: string;
  processingStatus?: "idle" | "processing" | "completed";
  captions?: {
    start: number;
    end: number;
    text: string;
  }[];
};

export type SceneVisualBlock = {
  id: string;
  type:
    | "paragraph"
    | "list"
    | "numbered-list"
    | "code"
    | "callout"
    | "quote"
    | "heading"
    | "caption";
  text: string;
  items?: string[];
  stepIndex?: number;
  startTime?: number;
  duration?: number;
};

export type PaperAnswerField = {
  id: string;
  label: string;
  lines?: number;
  placeholder?: string;
  suffix?: string;
};

export type PaperMarkSchemeItem = {
  criterion: string;
  marks: number;
};

export type PaperQuestionPart = {
  id: string;
  label: string;
  prompt: string;
  marks: number;
  answerFields?: PaperAnswerField[];
};

export type PaperQuestion = {
  paperRef: string;
  questionRef: string;
  marks: number;
  prompt: string;
  answerFields: PaperAnswerField[];
  parts?: PaperQuestionPart[];
  markScheme?: PaperMarkSchemeItem[];
};

export type Scene = {
  id: string;
  type: SceneType;
  title: string;
  eyebrow?: string;
  duration: number;
  narration: string;
  captions: CaptionSegment[];
  blocks?: string[];
  visualBlocks?: SceneVisualBlock[];
  diagram?: {
    bits: Array<{
      bit: 0 | 1;
      value: number;
      active?: boolean;
    }>;
    result?: string;
  };
  code?: string;
  question?: string;
  choices?: string[];
  answer?: string;
  paperQuestion?: PaperQuestion;
  examinerInsight?: string;
  voiceover?: SceneVoiceover;
  layout?: {
    horizontalAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "center" | "bottom";
  };
};
