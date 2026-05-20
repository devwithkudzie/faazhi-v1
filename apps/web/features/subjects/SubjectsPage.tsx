"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock, GraduationCap, TrendingUp } from "lucide-react";

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
  const { user } = useAuth();

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </p>
          <h1 className="mt-1 font-serif-paper text-3xl font-medium text-foreground/90">
            Your learning workspace
          </h1>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-4">
          <StatCard icon={GraduationCap} label="Subjects" value="3" />
          <StatCard icon={BookOpen} label="Topics completed" value="8" />
          <StatCard icon={TrendingUp} label="Average score" value="72%" />
          <StatCard icon={Clock} label="Study streak" value="4 days" />
        </div>

        <section className="mt-7 rounded-2xl border border-border/60 bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-medium text-foreground/90">Continue learning</h2>
              <p className="text-sm text-muted-foreground">
                Computer Science → Data Representation
              </p>
            </div>

            <Button
              asChild
              className="bg-[#1557c0] text-white hover:bg-[#0f49a7]"
            >
              <Link href="/subjects/9618/learn">
                Continue <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-7">
          <h2 className="font-medium text-foreground/90">My subjects</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <article
                key={subject.id}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-[#1557c0]/30 hover:shadow-[0_8px_20px_rgba(21,87,192,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#1557c0]">
                      {subject.code}
                    </p>
                    <h3 className="mt-1 text-lg font-medium text-foreground/90">
                      {subject.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {subject.level}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eaf2ff] px-2 py-1 text-xs font-medium text-[#1557c0]">
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
                      className="h-full rounded-full bg-[#1557c0]"
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Last activity: {subject.lastActivity}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="bg-[#1557c0] text-white hover:bg-[#0f49a7]"
                  >
                    <Link href={`/subjects/${subject.id}`}>
                      {subject.progress > 0 ? "Continue" : "Open subject"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-[#bfdbfe] text-[#1557c0] hover:bg-[#dbeafe] hover:text-[#1557c0]"
                  >
                    <Link href={`/subjects/${subject.id}/learn`}>
                      Example
                    </Link>
                  </Button>
                </div>
              </article>
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
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <Icon className="h-5 w-5 text-primary/85" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-medium text-foreground/90">{value}</p>
    </div>
  );
}
