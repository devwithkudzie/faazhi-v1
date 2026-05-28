export type UserRole = "student" | "admin";
export type PublishStatus = "draft" | "published" | "archived";
export type SceneBlockType = "paragraph" | "list" | "keyIdea" | "quote" | "code";
export type ListKind = "bullet" | "numbered";
export type SceneAnimation = "none" | "fade" | "slide-up" | "zoom";
export type SubjectAccessStatus = "trialing" | "active" | "expired" | "cancelled";
export type SubjectLevel = "igcse" | "a-level";
export type StoredWorkspaceDraft = unknown;

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatarColor: string;
  centreNumber?: string;
  candidateNumber?: string;
  enrolledSubjectIds: string[];
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  level: SubjectLevel;
  status: PublishStatus;
  isFree: boolean;
  theme: {
    accent: string;
    canvasBackground: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  subjectId: string;
  status: "active" | "paused";
  enrolledAt: string;
}

export interface SubjectAccess {
  id: string;
  studentId: string;
  subjectId: string;
  status: SubjectAccessStatus;
  trialStartedAt?: string;
  trialEndsAt?: string;
  subscribedAt?: string;
  currentPeriodEndsAt?: string;
  cancelledAt?: string;
  updatedAt: string;
}

export interface Paper {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: PublishStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  subjectId: string;
  paperId: string;
  title: string;
  description: string;
  status: PublishStatus;
  estimatedMinutes: number;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  lessonId: string;
  title: string;
  type: "concept" | "diagram" | "example" | "checkpoint" | "exam-extract";
  status: PublishStatus;
  order: number;
  durationSeconds: number;
  animation: SceneAnimation;
  background: string;
  narrationAudioId?: string;
}

export interface SceneBlock {
  id: string;
  sceneId: string;
  type: SceneBlockType;
  content: string;
  items?: string[];
  listKind?: ListKind;
  language?: "pseudocode" | "python" | "javascript" | "plain";
  alignX: "left" | "center" | "right";
  alignY: "top" | "middle" | "bottom";
  stepIndex: number;
  startTime: number;
  duration: number;
  animation: SceneAnimation;
  order: number;
}

export interface NarrationAudio {
  id: string;
  lessonId: string;
  sceneId?: string;
  fileName: string;
  contentType: string;
  fileUrl: string;
  durationSeconds?: number;
  transcript?: string;
  createdAt: string;
}

export interface LessonProgress {
  id: string;
  studentId: string;
  lessonId: string;
  sceneId?: string;
  completed: boolean;
  lastPositionSeconds: number;
  updatedAt: string;
}

export interface AccountSettings {
  productName: string;
  supportEmail: string;
  defaultStudentTheme: string;
}

export interface PaperWorkspace {
  id: string;
  subjectId: string;
  paperId: string;
  draft: StoredWorkspaceDraft;
  createdAt: string;
  updatedAt: string;
}

export interface StoreData {
  users: User[];
  sessions: Session[];
  subjects: Subject[];
  papers: Paper[];
  subjectAccess: SubjectAccess[];
  enrollments: Enrollment[];
  lessons: Lesson[];
  scenes: Scene[];
  blocks: SceneBlock[];
  narration: NarrationAudio[];
  progress: LessonProgress[];
  workspaces: PaperWorkspace[];
  accountSettings: AccountSettings;
}
