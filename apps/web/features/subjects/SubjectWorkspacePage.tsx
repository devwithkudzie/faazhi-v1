"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Binary,
  CheckCircle2,
  ChevronDown,
  CircuitBoard,
  Circle,
  Clock,
  Code2,
  FileText,
  Flame,
  Sparkles,
  Star,
  Table2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/shared/components/layout/AppShell";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";
import styles from "./subject-workspace.module.css";
import type { AdminPaperDraft } from "@/features/admin/papers/types/paper-workspace.types";
import { getPaperDurationMinutes } from "@/features/admin/papers/services/paper-workspace.service";

const tools = [
  { label: "Pseudocode Runner", href: "playground?tool=pseudocode", icon: Code2 },
  { label: "Diagram Sandbox", href: "playground?tool=diagram", icon: Binary },
  { label: "Logic Gate Simulator", href: "playground?tool=logic-gates", icon: CircuitBoard },
  { label: "Trace Table Builder", href: "playground?tool=trace-table", icon: Table2 },
  { label: "Progress", href: "progress", icon: BarChart3 },
];

const topics = [
  { name: "Information Representation", done: true },
  { name: "Communication & Networking", done: true },
  { name: "Hardware & Virtual Machines", done: false },
  { name: "Logic Gates & Boolean Algebra", done: false },
  { name: "Databases & File Organisation", done: false },
  { name: "Algorithm Design & Analysis", done: false },
  { name: "Programming Fundamentals", done: false },
];

const recent = [
  { label: "Completed: Two's Complement", time: "2h ago" },
  { label: "Attempted: 9618 Paper 2 Q4", time: "Yesterday" },
  { label: "Completed: Character Encoding", time: "2 days ago" },
];

const pageNav = [
  { label: "About", href: "#about", id: "about" },
  { label: "Modules", href: "#modules", id: "modules" },
  { label: "Practice", href: "#practice", id: "practice" },
  { label: "Tools", href: "#tools", id: "tools" },
  { label: "Testimonials", href: "#testimonials", id: "testimonials" },
];

const syllabusObjectives = [
  "Understand the core principles of computer systems, data, networks, software, and security.",
  "Apply computational thinking to break complex problems into structured solutions.",
  "Read, write, trace, test, and improve algorithms using Cambridge-style pseudocode.",
  "Connect theory knowledge with past-paper questions and practical programming tasks.",
];

const skillsGained = [
  "Algorithmic problem solving",
  "Programming fluency",
  "Trace-table reasoning",
  "Database and network analysis",
  "Exam technique",
  "Independent revision planning",
];

const testimonials = [
  {
    name: "Tariro M.",
    meta: "Learner since 2024",
    avatar: "TM",
    photoClass: "bg-[radial-gradient(circle_at_50%_30%,#fde68a_0_18%,#f59e0b_19%_34%,#92400e_35%_100%)]",
    quote:
      "The module progress makes it easy to see which paper I should revise next. I can work on Paper 2 without feeling behind on Paper 1.",
  },
  {
    name: "Aisha K.",
    meta: "Learner since 2023",
    avatar: "AK",
    photoClass: "bg-[radial-gradient(circle_at_50%_28%,#fbcfe8_0_18%,#be185d_19%_34%,#831843_35%_100%)]",
    quote:
      "The pseudocode practice helped me stop guessing. I can now trace algorithms and explain what each step is doing.",
  },
  {
    name: "Daniel R.",
    meta: "Learner since 2025",
    avatar: "DR",
    photoClass: "bg-[radial-gradient(circle_at_50%_30%,#bfdbfe_0_18%,#2563eb_19%_34%,#1e3a8a_35%_100%)]",
    quote:
      "PaperLab turned past-paper practice into a weekly routine. The workspace feels focused and exam-ready.",
  },
  {
    name: "Mr. Ncube",
    meta: "Computer Science tutor",
    avatar: "MN",
    photoClass: "bg-[radial-gradient(circle_at_50%_28%,#bbf7d0_0_18%,#16a34a_19%_34%,#14532d_35%_100%)]",
    quote:
      "I like that each paper can be tracked independently. It matches how students actually prepare for 9618.",
  },
];

const reviews = [
  {
    rating: 5,
    name: "KS",
    date: "Reviewed on May 8, 2026",
    body: "Very useful for organising revision. The module breakdown makes the syllabus less overwhelming, especially for Paper 2 practice.",
  },
  {
    rating: 5,
    name: "JM",
    date: "Reviewed on Apr 18, 2026",
    body: "The tools are exactly what I need for Computer Science: pseudocode, diagrams, logic gates, and trace tables in one place.",
  },
  {
    rating: 4,
    name: "PL",
    date: "Reviewed on Mar 2, 2026",
    body: "Strong subject workspace. I would like even more marked examples, but the progress tracking is already very helpful.",
  },
];

const ratingBreakdown = [
  { label: "5 stars", value: 86 },
  { label: "4 stars", value: 11 },
  { label: "3 stars", value: 2 },
  { label: "2 stars", value: 0.6 },
  { label: "1 star", value: 0.4 },
];

interface ExploreSubject {
  id: string;
  code: string;
  name: string;
  description: string;
  level: "igcse" | "a-level";
  isFree: boolean;
  access: {
    status: string;
    hasAccess: boolean;
    label: string;
  };
}

interface ApiPaper {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  status: "draft" | "published" | "archived";
  order: number;
}

interface ApiLesson {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  estimatedMinutes: number;
}

function readSavedPaperDraft(subjectId: string, paperId: string) {
  if (typeof window === "undefined") return null;

  const saved =
    window.localStorage.getItem(`faazhi.workspace.${subjectId}.${paperId}`) ??
    window.localStorage.getItem(
      `faazhi.admin.paper-draft.${subjectId}.${paperId}`,
    );
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as { draft?: AdminPaperDraft } | AdminPaperDraft;
    if ("draft" in parsed && parsed.draft) return parsed.draft;
    return "subjectId" in parsed ? parsed : null;
  } catch {
    return null;
  }
}

function getDraftContactMinutes(draft: AdminPaperDraft | null) {
  return draft ? getPaperDurationMinutes(draft) : 0;
}

function formatContactTime(minutes: number) {
  if (minutes <= 0) return "To be planned";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export default function SubjectWorkspacePage({
  subjectId,
}: {
  subjectId: string;
}) {
  const { token } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(pageNav[0].id);
  const [subject, setSubject] = useState<ExploreSubject | null>(null);
  const [papers, setPapers] = useState<ApiPaper[]>([]);
  const [lessonsByPaper, setLessonsByPaper] = useState<Record<string, ApiLesson[]>>({});
  const [workspacesByPaper, setWorkspacesByPaper] = useState<Record<string, AdminPaperDraft>>({});
  const [accessBusy, setAccessBusy] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    apiRequest<{ subjects: ExploreSubject[] }>("/api/explore/subjects", {
      token,
    })
      .then((result) => {
        if (!cancelled) {
          setSubject(
            result.subjects.find((item) => item.id === subjectId) ?? null,
          );
        }
      })
      .catch(() => {
        if (!cancelled) setSubject(null);
      });

    return () => {
      cancelled = true;
    };
  }, [subjectId, token]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadPapers() {
      const paperResult = await apiRequest<{ papers: ApiPaper[] }>(
        `/api/subjects/${subjectId}/papers`,
        { token },
      );
      const lessonEntries = await Promise.all(
        paperResult.papers.map(async (paper) => {
          const lessonResult = await apiRequest<{ lessons: ApiLesson[] }>(
            `/api/papers/${paper.id}/lessons`,
            { token },
          );
          return [paper.id, lessonResult.lessons] as const;
        }),
      );
      const workspaceEntries = await Promise.all(
        paperResult.papers.map(async (paper) => {
          const workspaceResult = await apiRequest<{
            workspace: AdminPaperDraft | null;
          }>(`/api/papers/${paper.id}/workspace`, { token });
          return [paper.id, workspaceResult.workspace] as const;
        }),
      );

      if (!cancelled) {
        setPapers(paperResult.papers);
        setLessonsByPaper(Object.fromEntries(lessonEntries));
        setWorkspacesByPaper(
          Object.fromEntries(
            workspaceEntries.filter(
              (entry): entry is [string, AdminPaperDraft] =>
                Boolean(entry[1]),
            ),
          ),
        );
      }
    }

    loadPapers().catch(() => {
      if (!cancelled) {
        setPapers([]);
        setLessonsByPaper({});
        setWorkspacesByPaper({});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [subjectId, token]);

  async function unsubscribe() {
    if (!token || !subject || subject.isFree) return;

    setAccessBusy(true);

    try {
      await apiRequest(`/api/subjects/${subject.id}/unsubscribe`, {
        method: "POST",
        token,
      });
      router.push("/subjects");
    } finally {
      setAccessBusy(false);
    }
  }

  useEffect(() => {
    const sections = pageNav
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-96px 0px -58% 0px",
        threshold: [0.12, 0.24, 0.48],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const subjectLevel =
    subject?.level === "igcse" ? "Cambridge IGCSE" : "Cambridge A Level";
  const paperModules = papers
  .filter((paper) => paper.status === "published")
  .map((paper) => {
    const lessons = lessonsByPaper[paper.id] ?? [];
    const savedDraft =
      workspacesByPaper[paper.id] ?? readSavedPaperDraft(subjectId, paper.id);
    const savedContactMinutes = getDraftContactMinutes(savedDraft);
    const contactMinutes = savedContactMinutes
      ? savedContactMinutes
      : lessons.reduce((total, lesson) => total + lesson.estimatedMinutes, 0);

    return {
      id: paper.id,
      name: savedDraft?.paperMeta?.title ?? paper.title,
      title: savedDraft?.paperMeta?.description ?? paper.description ?? "Paper outline",
      progress: 0,
      completed: 0,
      estimatedTime: formatContactTime(contactMinutes),
      focus:
        savedDraft?.paperMeta?.description ||
        paper.description ||
        "This paper is ready for lessons and subject-specific details.",
      learningOutcomes:
        savedDraft?.paperMeta?.learningOutcomes ??
        savedDraft?.subjectMeta?.learningOutcomes ??
        syllabusObjectives,
      skills:
        savedDraft?.paperMeta?.skills ??
        savedDraft?.subjectMeta?.skills ??
        skillsGained,
      topics: savedDraft?.topics.length
        ? savedDraft.topics
            .filter((topic) => (topic.status ?? "draft") === "published")
            .map((topic) => topic.title)
        : lessons.map((lesson) => lesson.title),
    };
  });
  const subjectOutcomes =
    paperModules[0]?.learningOutcomes ?? syllabusObjectives;
  const subjectSkills = paperModules[0]?.skills ?? skillsGained;
  const primaryPaper = paperModules[0];
  const usefulDetails = [
    { label: "Qualification", value: subjectLevel },
    { label: "Syllabus", value: subject ? `${subject.name} ${subject.code}` : subjectId },
    {
      label: "Assessment",
      value: `${paperModules.length} paper${paperModules.length === 1 ? "" : "s"} available`,
    },
  ];

  return (
    <AppShell>
      <section className="bg-background">
        <div
          className="bg-[#eef3ff] shadow-[0_20px_70px_rgba(37,99,235,0.12)]"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
              <div>
                <span className="inline-flex rounded-full border border-primary/15 bg-white px-3 py-1 text-xs font-medium text-primary">
                  {subjectLevel} · {subject?.code ?? subjectId}
                </span>

                <h1 className="mt-4 font-serif-paper text-4xl font-semibold tracking-tight text-foreground">
                  {subject ? `${subject.name} ${subject.code}` : "Subject"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {subject?.description ??
                    "Explore guided lessons, practice, and exam-ready study tools."}
                </p>

                {subject ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#1557c0] ring-1 ring-blue-100">
                      {subject.access.label}
                    </span>
                    {!subject.isFree && subject.access.hasAccess ? (
                      <button
                        type="button"
                        onClick={() => void unsubscribe()}
                        disabled={accessBusy}
                        className="bg-white px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-50 disabled:opacity-60"
                      >
                        {accessBusy ? "Cancelling..." : "Unsubscribe"}
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    7 day streak
                  </span>

                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    74% average score
                  </span>

                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Last: Data Representation
                  </span>
                </div>

                <div className="mt-6 max-w-md">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subject progress</span>
                    <span>42%</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full w-[42%] rounded-full bg-primary" />
                  </div>
                </div>
              </div>

              <Link
                href={
                  primaryPaper
                    ? `/subjects/${subjectId}/learn/${primaryPaper.id}`
                    : `/subjects/${subjectId}`
                }
                className="rounded-2xl border border-primary/10 bg-white p-5 text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:shadow-md"
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Continue your paper
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  {primaryPaper
                    ? `${primaryPaper.name}: ${primaryPaper.title}`
                    : "No papers yet"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {primaryPaper
                    ? `${primaryPaper.topics.length} main topics · ${primaryPaper.estimatedTime} contact time`
                    : "Your lessons will appear here once an admin adds papers."}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0645ad] px-3 py-2 text-sm font-semibold text-white">
                  Open paper <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <nav className="sticky top-0 z-[100] bg-white shadow-[0_10px_34px_rgba(15,23,42,0.12)] dark:bg-card">
          <div className="absolute inset-0 -z-10 bg-white dark:bg-card" />

          <div className="relative mx-auto flex max-w-7xl items-center gap-12 px-4 sm:px-6 lg:px-8">
            <Link
              href="#about"
              className="hidden min-w-60 shrink-0 py-5 text-base font-semibold text-foreground md:block"
            >
              {subject ? `${subject.name} ${subject.code}` : subjectId}
            </Link>

            <div className="grid min-w-0 flex-1 auto-cols-[minmax(150px,1fr)] grid-flow-col gap-4 overflow-x-auto lg:auto-cols-fr lg:gap-6">
              {pageNav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setActiveSection(item.id)}
                  className={[
                    "my-2 flex min-h-12 items-center justify-center rounded-md px-4 py-3 text-center text-base font-semibold transition",
                    activeSection === item.id
                      ? "bg-[#eef5ff] text-[#0645ad]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <section
              id="about"
              className={`${styles.section} rounded-lg bg-card p-6 shadow-[0_14px_34px_rgba(15,23,42,0.07)]`}
            >
              <h2 className="font-semibold text-foreground">About this subject</h2>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-lg bg-background p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                  <h3 className="text-sm font-semibold text-foreground">
                    What you will learn
                  </h3>

                  <div className="mt-4 space-y-3">
                    {subjectOutcomes.map((objective) => (
                      <div key={objective} className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <p className="text-sm leading-6 text-foreground">
                          {objective}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-lg bg-background p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                    <h3 className="text-sm font-semibold text-foreground">
                      Skills to be gained
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {subjectSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-background p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                    <h3 className="text-sm font-semibold text-foreground">
                      Useful details
                    </h3>

                    <dl className="mt-4 space-y-3">
                      {usefulDetails.map((detail) => (
                        <div key={detail.label}>
                          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {detail.label}
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">
                            {detail.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="modules"
              className={`${styles.section} rounded-lg bg-card p-6 shadow-[0_14px_34px_rgba(15,23,42,0.07)]`}
            >
              <h2 className="font-semibold text-foreground">
                {paperModules.length} paper{paperModules.length === 1 ? "" : "s"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Each paper pathway can be completed independently, with its own
                lessons, practice, and progress.
              </p>

              <div className="mt-5 space-y-3">
                {paperModules.map((module) => (
                  <details
                    key={module.id}
                    className={`${styles.module} rounded-lg bg-background shadow-[0_1px_4px_rgba(15,23,42,0.07)] transition hover:bg-[#f5f9ff] hover:shadow-[0_8px_24px_rgba(6,69,173,0.12)]`}
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {module.name}: {module.title}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {module.topics.length} main topics
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#0645ad]">
                          Estimated contact time: {module.estimatedTime}
                        </p>
                      </div>

                      <div className="hidden w-36 shrink-0 sm:block">
                        <div className="flex justify-between text-xs font-semibold text-[#0645ad]">
                          <span>Progress</span>
                          <span>{module.progress}%</span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dbeafe]">
                          <div
                            className="h-full rounded-full bg-[#0645ad]"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>

                      <ChevronDown
                        className={`${styles.chevron} h-4 w-4 shrink-0 text-muted-foreground transition`}
                      />
                    </summary>

                    <div className="px-4 pb-4 pt-2">
                      <div className="sm:hidden">
                        <div className="flex justify-between text-xs font-semibold text-[#0645ad]">
                          <span>Module progress</span>
                          <span>{module.progress}%</span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dbeafe]">
                          <div
                            className="h-full rounded-full bg-[#0645ad]"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground sm:mt-0">
                        {module.focus}
                      </p>

                      <div className="mt-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Main topics
                        </h3>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {module.topics.map((topic) => (
                            <div
                              key={topic}
                              className="flex items-center gap-2 rounded-md bg-card px-3 py-2 text-sm text-foreground shadow-[inset_0_0_0_1px_rgba(148,163,184,0.16)]"
                            >
                              <Circle className="h-3 w-3 shrink-0 text-primary/60" />
                              {topic}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Link
                        href={`/subjects/${subjectId}/learn/${module.id}`}
                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#0645ad] px-3 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(6,69,173,0.18)] transition hover:bg-[#053a91]"
                      >
                        Open paper
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <section
              id="practice"
              className={`${styles.section} rounded-lg bg-[#eef5ff] p-6 shadow-[0_14px_34px_rgba(6,69,173,0.1),inset_0_0_0_1px_rgba(6,69,173,0.12)]`}
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_260px] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0645ad]">
                    Practice
                  </p>

                  <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-foreground">
                    <FileText className="h-5 w-5 text-[#0645ad]" />
                    PaperLab
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Practise complete exam papers, time sections, review mark
                    schemes, and build confidence before moving back into
                    module study.
                  </p>
                </div>

                <Link
                  href={`/subjects/${subjectId}/papers`}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0645ad] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(6,69,173,0.2)] transition hover:bg-[#053a91]"
                >
                  Open PaperLab <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <section
              id="tools"
              className={`${styles.section} rounded-lg bg-card p-6 shadow-[0_14px_34px_rgba(15,23,42,0.07)]`}
            >

              <h2 className="font-semibold text-foreground">Tools</h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={`/subjects/${subjectId}/${tool.href}`}
                    className="flex items-center gap-3 rounded-lg bg-background p-4 shadow-[0_1px_4px_rgba(15,23,42,0.07)] transition hover:bg-primary-soft"
                  >
                    <tool.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {tool.label}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-card p-6 shadow-[0_14px_34px_rgba(15,23,42,0.07)]">
              <h2 className="font-semibold text-foreground">
                Syllabus topics
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {topics.map((topic) => (
                  <div
                    key={topic.name}
                    className="flex items-center gap-3 rounded-lg bg-background px-4 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.06)]"
                  >
                    {topic.done ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40" />
                    )}

                    <span className="text-sm text-foreground">
                      {topic.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="testimonials"
              className={`${styles.section} rounded-lg bg-card p-6 shadow-[0_14px_34px_rgba(15,23,42,0.07)]`}
            >
              <h2 className="text-2xl font-semibold text-foreground">
                Why learners choose this workspace
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {testimonials.map((item) => (
                  <figure
                    key={item.quote}
                    className="rounded-lg bg-background p-5 shadow-[0_1px_4px_rgba(15,23,42,0.07),inset_0_0_0_1px_rgba(148,163,184,0.18)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className={`h-14 w-14 shrink-0 rounded-full ${item.photoClass}`}
                      />

                      <div>
                        <figcaption className="font-semibold text-foreground">
                          {item.name}
                        </figcaption>

                        <p className="text-sm text-muted-foreground">
                          {item.meta}
                        </p>
                      </div>
                    </div>

                    <blockquote className="mt-5 text-sm leading-7 text-muted-foreground">
                      &quot;{item.quote}&quot;
                    </blockquote>
                  </figure>
                ))}
              </div>
            </section>

            <section
              id="reviews"
              className={`${styles.section} rounded-lg bg-card p-6 shadow-[0_14px_34px_rgba(15,23,42,0.07)]`}
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-2xl font-semibold text-foreground">
                  Learner reviews
                </h2>

                <p className="text-sm text-muted-foreground">
                  Showing 3 of 1,284 reviews
                </p>
              </div>

              <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-primary text-primary" />

                    <p className="text-3xl font-semibold text-foreground">
                      4.8
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    1,284 reviews
                  </p>

                  <div className="mt-6 space-y-3">
                    {ratingBreakdown.map((item) => (
                      <div
                        key={item.label}
                        className="grid grid-cols-[58px_1fr_46px] items-center gap-3 text-sm"
                      >
                        <span className="font-medium text-[#0645ad]">
                          {item.label}
                        </span>

                        <div className="h-2 overflow-hidden rounded-full bg-[#dbeafe]">
                          <div
                            className="h-full rounded-full bg-[#0645ad]"
                            style={{ width: `${item.value}%` }}
                          />
                        </div>

                        <span className="text-right font-medium text-[#0645ad]">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <article
                      key={`${review.name}-${review.date}`}
                      className="grid gap-4 rounded-lg bg-background p-5 shadow-[0_1px_4px_rgba(15,23,42,0.07),inset_0_0_0_1px_rgba(148,163,184,0.18)] md:grid-cols-[72px_1fr]"
                    >
                      <div className="flex items-center gap-3 md:block">
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-[#0645ad] text-lg font-semibold text-white">
                          {review.name}
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            {review.rating}
                          </span>

                          <span className="text-muted-foreground">
                            {review.date}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-7 text-foreground">
                          {review.body}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="grid gap-6 md:grid-cols-2">
            <section className="rounded-lg bg-card p-6 shadow-[0_14px_34px_rgba(15,23,42,0.07)]">
              <h2 className="font-semibold text-foreground">
                Recent activity
              </h2>

              <div className="mt-4 space-y-4">
                {recent.map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary/40" />

                    <div>
                      <p className="text-sm text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-amber-50 p-6 shadow-[0_14px_34px_rgba(180,83,9,0.12)]">
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-amber-600" />

                <div>
                  <h2 className="font-semibold text-foreground">
                    Recommended next
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Practise Trace Tables because your algorithm score is below
                    average.
                  </p>

                  <Link
                    href={`/subjects/${subjectId}/learn/algorithms/trace-tables`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Start topic <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
