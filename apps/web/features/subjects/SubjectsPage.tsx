"use client";

import Link from "next/link";
import { BookOpen, Clock, GraduationCap, TrendingUp } from "lucide-react";

import { Logo } from "@/shared/components/layout/Logo";
import { ThemeToggle } from "@/shared/components/layout/ThemeToggle";
import { Button } from "@/shared/ui/button";
import { useAuth } from "@/shared/providers/AuthProvider";
import { AppShell } from "@/shared/components/layout/AppShell";

const subjects = [
  {
    id: "9618",
    name: "Computer Science",
    code: "9618",
    level: "Cambridge A Level",
    progress: 42,
    lastActivity: "Data Representation",
  },
  {
    id: "9709",
    name: "Mathematics",
    code: "9709",
    level: "Cambridge A Level",
    progress: 0,
    lastActivity: "Coming soon",
  },
  {
    id: "9702",
    name: "Physics",
    code: "9702",
    level: "Cambridge A Level",
    progress: 0,
    lastActivity: "Coming soon",
  },
];

export default function SubjectsPage() {
  const { user, signOut } = useAuth();

  return (
    <AppShell>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </p>
          <h1 className="mt-1 font-serif-paper text-3xl font-semibold text-foreground">
            Your learning workspace
          </h1>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard icon={GraduationCap} label="Subjects" value="3" />
          <StatCard icon={BookOpen} label="Topics completed" value="8" />
          <StatCard icon={TrendingUp} label="Average score" value="72%" />
          <StatCard icon={Clock} label="Study streak" value="4 days" />
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">Continue learning</h2>
              <p className="text-sm text-muted-foreground">
                Computer Science → Data Representation
              </p>
            </div>

            <Button asChild>
              <Link href="/subjects/9618/learn">Continue</Link>
            </Button>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-semibold text-foreground">My subjects</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {subject.code}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">
                      {subject.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {subject.level}
                    </p>
                  </div>

                  <span className="rounded-full bg-primary-soft px-2 py-1 text-xs font-medium text-primary">
                    {subject.progress}%
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{subject.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Last activity: {subject.lastActivity}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}