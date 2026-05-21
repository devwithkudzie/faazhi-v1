import type {
  AdminSubject,
  SubjectDraftResult,
  SubjectFormInput,
  StarterTemplateItem,
} from "@/features/admin/subjects/types/subject.types";

export const computerScienceStarterTemplate: StarterTemplateItem[] = [
  { label: "Paper / module", title: "Paper 1", status: "draft" },
  { label: "Topic", title: "Information Representation", status: "draft" },
  { label: "Subtopic", title: "Number systems", status: "draft" },
  { label: "Lesson", title: "Binary number systems", status: "draft" },
  { label: "Scene", title: "What is binary?", status: "draft" },
];

export const mathematicsStarterTemplate: StarterTemplateItem[] = [
  { label: "Paper / module", title: "Paper 1", status: "draft" },
  { label: "Topic", title: "Quadratics", status: "draft" },
  { label: "Subtopic", title: "Solving quadratics", status: "draft" },
  { label: "Lesson", title: "Completing the square", status: "draft" },
  { label: "Scene", title: "Why complete the square?", status: "draft" },
];

export const physicsStarterTemplate: StarterTemplateItem[] = [
  { label: "Paper / module", title: "Paper 1", status: "draft" },
  { label: "Topic", title: "Kinematics", status: "draft" },
  { label: "Subtopic", title: "Motion graphs", status: "draft" },
  { label: "Lesson", title: "Displacement-time graphs", status: "draft" },
  { label: "Scene", title: "Gradient means velocity", status: "draft" },
];

export const starterTemplate = computerScienceStarterTemplate;

export const adminSubjects: AdminSubject[] = [
  {
    id: "9618",
    name: "Computer Science",
    code: "9618",
    level: "Cambridge A Level",
    description: "Scene-based preparation for Cambridge Computer Science.",
    status: "published",
    updatedAt: "Updated today",
    studentCount: 1240,
    completionRate: 64,
    lessons: 42,
    assessments: 8,
    averageScore: 72,
    papers: [
      {
        id: "paper-1",
        title: "Paper 1",
        status: "published",
        topics: 5,
        scenes: 28,
        completionRate: 64,
      },
      {
        id: "paper-2",
        title: "Paper 2",
        status: "draft",
        topics: 4,
        scenes: 14,
        completionRate: 31,
      },
    ],
    starterTemplate: computerScienceStarterTemplate,
  },
  {
    id: "9709",
    name: "Mathematics",
    code: "9709",
    level: "Cambridge A Level",
    description: "Draft syllabus structure for Mathematics papers.",
    status: "draft",
    updatedAt: "Updated 2 days ago",
    studentCount: 0,
    completionRate: 0,
    lessons: 2,
    assessments: 1,
    averageScore: 0,
    papers: [
      {
        id: "paper-1",
        title: "Paper 1",
        status: "draft",
        topics: 2,
        scenes: 3,
        completionRate: 0,
      },
    ],
    starterTemplate: mathematicsStarterTemplate,
  },
  {
    id: "9702",
    name: "Physics",
    code: "9702",
    level: "Cambridge A Level",
    description: "Physics content workspace pending review.",
    status: "draft",
    updatedAt: "Updated 5 days ago",
    studentCount: 0,
    completionRate: 0,
    lessons: 2,
    assessments: 1,
    averageScore: 0,
    papers: [
      {
        id: "paper-1",
        title: "Paper 1",
        status: "draft",
        topics: 2,
        scenes: 3,
        completionRate: 0,
      },
    ],
    starterTemplate: physicsStarterTemplate,
  },
];

export function getAdminSubject(subjectId: string) {
  return (
    adminSubjects.find((subject) => subject.id === subjectId) ??
    adminSubjects[0]
  );
}

export function getAdminPaper(subjectId: string, paperId: string) {
  const subject = getAdminSubject(subjectId);

  return (
    subject.papers.find((paper) => paper.id === paperId) ?? subject.papers[0]
  );
}

export function getDraftSubjects() {
  return adminSubjects.filter((subject) => subject.status === "draft");
}

export function getPublishedSubjects() {
  return adminSubjects.filter((subject) => subject.status === "published");
}

export function createSubjectDraft(input: SubjectFormInput): SubjectDraftResult {
  const selectedStarterTemplate = getStarterTemplateForSubjectCode(input.code);
  const subject: AdminSubject = {
    id: input.code.toLowerCase().replaceAll(" ", "-") || "new-subject",
    name: input.name || "Untitled subject",
    code: input.code || "DRAFT",
    level: input.level || "Cambridge A Level",
    description: input.description || "Draft subject workspace.",
    status: "draft",
    updatedAt: "Created just now",
    studentCount: 0,
    completionRate: 0,
    lessons: 1,
    assessments: 0,
    averageScore: 0,
    papers: [
      {
        id: "paper-1",
        title: "Paper 1",
        status: "draft",
        topics: 1,
        scenes: 1,
        completionRate: 0,
      },
    ],
    starterTemplate: selectedStarterTemplate,
  };

  return {
    subject,
    starterTemplate: selectedStarterTemplate,
  };
}

function getStarterTemplateForSubjectCode(code: string) {
  if (code.trim() === "9709") {
    return mathematicsStarterTemplate;
  }

  if (code.trim() === "9702") {
    return physicsStarterTemplate;
  }

  return computerScienceStarterTemplate;
}
