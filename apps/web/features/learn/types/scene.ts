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

export type PaperQuestion = {
  paperRef: string;
  questionRef: string;
  marks: number;
  prompt: string;
  answerFields: PaperAnswerField[];
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
};
