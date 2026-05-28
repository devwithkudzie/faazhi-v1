export type UserRole = "student" | "admin";

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  avatarColor: string;
  centreNumber?: string;
  candidateNumber?: string;
  // Subject IDs the student is enrolled in. Admins ignore this and see all subjects.
  enrolledSubjects?: string[];
  enrolledSubjectIds?: string[];
}

export type AnswerKind =
  | "short"        // single-line short answer
  | "long"         // multi-line lined answer space
  | "gap"          // small inline gap fill
  | "working"      // working-out box
  | "code"         // pseudocode / code box (monospace)
  | "table"        // table with cells (e.g. trace table)
  | "label"        // diagram label
  | "tick"         // single tick-box selection (one of N)
  | "multi_tick"   // multiple tick-boxes (zero or more of N)
  | "true_false"   // true/false toggle per row
  | "match"        // match items in column A to column B
  | "order"        // arrange items into a sequence
  | "classify"     // place items into table columns/categories
  | "diagram";     // student draws a flowchart / diagram (DiagramSandbox)

export interface AnswerSlot {
  id: string;
  kind: AnswerKind;
  // For tables
  columns?: string[];
  rows?: number;
  // Visual sizing hints
  lines?: number;
  placeholder?: string;
  // For tick / multi_tick / true_false: list of options (rows)
  options?: string[];
  // For tick row-style (e.g. "Bus / Star / Mesh" columns)
  optionColumns?: string[];
  // For match: left items (rows) and right items (columns)
  leftItems?: string[];
  rightItems?: string[];
  // For order: items to arrange (initial order)
  items?: string[];
  // For classify: categories (columns) + items (rows) to assign
  categories?: string[];
}

export interface MarkPoint {
  id: string;
  text: string;
  marks: number; // usually 1
  keywords?: string[];
  topic?: string;
}

export interface SubQuestion {
  id: string;            // e.g. "1a", "1bi"
  label: string;         // "(a)", "(b)(i)"
  prompt: string;        // question text
  marks: number;
  answer: AnswerSlot;
  markScheme: MarkPoint[];
  guidance?: string;     // examiner guidance shown in mark scheme panel
}

export interface Question {
  id: string;            // "q1"
  number: number;
  intro?: string;        // optional preamble (e.g. scenario)
  parts: SubQuestion[];
}

export interface Paper {
  id: string;
  code: string;          // 9618
  paperNumber: string;   // "11" / "21"
  title: string;
  subject: string;
  session: string;       // "Specimen 2025"
  durationMinutes: number;
  totalMarks: number;
  description: string;
  questions: Question[];
}

/* ---- attempts & marking ---- */

export type AttemptStatus =
  | "draft"
  | "submitted"           // awaiting marking
  | "ai_marked"           // AI suggestions ready, awaiting teacher
  | "marked";             // teacher confirmed

export interface AnnotationPin {
  id: string;
  partId: string;
  x: number; // 0..1 relative to paper sheet
  y: number;
  text: string;
  author: string;
  kind: "comment" | "tick" | "cross" | "circle" | "highlight";
}

export type AIAnnotationKind =
  | "correct"
  | "incorrect"
  | "too_vague"
  | "missing_keyword"
  | "follow_through"
  | "benefit_of_doubt"
  | "no_example"
  | "seen"
  | "not_answered";

export interface AISuggestion {
  partId: string;
  suggestedMarks: number;
  matchedMarkPointIds: string[];
  missingKeywords: string[];
  confidence: number; // 0..1
  annotation: AIAnnotationKind;
  reasoning: string;
}

export interface PartMark {
  partId: string;
  awardedMarks: number;          // teacher final
  awardedMarkPointIds: string[]; // ticked mark points
  comment?: string;              // teacher comment
  examinerNote?: string;         // private
  acceptedAI?: boolean;          // teacher accepted AI suggestion
  overrodeAI?: boolean;          // teacher disagreed with AI
}

export interface Answer {
  partId: string;
  // value can be string OR string[][] for tables
  value: string | string[][];
  flagged?: boolean;
}

export interface Attempt {
  id: string;
  paperId: string;
  studentId: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string;
  markedAt?: string;
  markedById?: string;
  durationUsedMinutes: number;
  answers: Answer[];
  marks: PartMark[];
  aiSuggestions: AISuggestion[];
  annotations: AnnotationPin[];
  totalAwarded?: number;
  feedback?: string;
}
