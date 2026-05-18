import Link from "next/link";
import { BarChart3, BookOpen, Code2, FileText } from "lucide-react";

const tools = [
  {
    title: "Learn",
    description: "Study notes, examples, Try It tasks, and checkpoints.",
    href: "learn",
    icon: BookOpen,
  },
  {
    title: "PaperLab",
    description: "Practise full exam papers in a realistic workspace.",
    href: "papers",
    icon: FileText,
  },
  {
    title: "Playground",
    description: "Experiment with pseudocode, diagrams, and concepts.",
    href: "playground",
    icon: Code2,
  },
  {
    title: "Progress",
    description: "Track topic mastery, weak areas, and performance.",
    href: "progress",
    icon: BarChart3,
  },
];

export default function SubjectWorkspacePage({
  subjectId,
}: {
  subjectId: string;
}) {
  return (
    <main className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-muted-foreground">Subject workspace</p>
        <h1 className="mt-1 font-serif-paper text-3xl font-semibold">
          Computer Science {subjectId}
        </h1>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={`/subjects/${subjectId}/${tool.href}`}
              className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-sm"
            >
              <tool.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-semibold text-foreground">{tool.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}