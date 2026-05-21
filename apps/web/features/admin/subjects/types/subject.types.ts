export type PublishStatus = "draft" | "published" | "archived";

export interface StarterTemplateItem {
  label: string;
  title: string;
  status: PublishStatus;
}

export interface AdminSubject {
  id: string;
  name: string;
  code: string;
  level: string;
  description: string;
  status: PublishStatus;
  updatedAt: string;
  studentCount: number;
  completionRate: number;
  lessons: number;
  assessments: number;
  averageScore: number;
  papers: SubjectPaperSummary[];
  starterTemplate: StarterTemplateItem[];
}

export interface SubjectPaperSummary {
  id: string;
  title: string;
  status: PublishStatus;
  topics: number;
  scenes: number;
  completionRate: number;
}

export interface SubjectFormInput {
  name: string;
  code: string;
  level: string;
  description: string;
}

export interface SubjectDraftResult {
  subject: AdminSubject;
  starterTemplate: StarterTemplateItem[];
}
