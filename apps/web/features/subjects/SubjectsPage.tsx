"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";

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
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-white/88 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Welcome back{user?.name ? `, ${user.name}` : ""}
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                Your learning workspace
              </h1>
            </div>

            <div className="rounded-2xl bg-[#eaf2ff] px-4 py-3 text-sm font-semibold text-[#1557c0]">
              Cambridge mastery plan
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-4">
            <StatCard icon={GraduationCap} label="Subjects" value="3" />
            <StatCard icon={BookOpen} label="Topics completed" value="8" />
            <StatCard icon={TrendingUp} label="Average score" value="72%" />
            <StatCard icon={Clock} label="Study streak" value="4 days" />
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-[28px] bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
          <div className="flex flex-wrap items-center justify-between gap-5 p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eaf2ff] text-[#1557c0]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Continue learning
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Computer Science · Data Representation
                </p>
              </div>
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

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-950">My subjects</h2>
            <p className="text-sm text-muted-foreground">
              Pick up where you left off
            </p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <article
                key={subject.id}
                className="rounded-[24px] bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(21,87,192,0.13)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1557c0]">
                      {subject.code}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                      {subject.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {subject.level}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-sm font-semibold text-[#1557c0]">
                    {subject.progress}%
                  </span>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Progress</span>
                    <span className="font-semibold">{subject.progress}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#1557c0]"
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>

                <p className="mt-6 text-sm text-muted-foreground">
                  Last activity: {subject.lastActivity}
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
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
    <div className="rounded-2xl bg-[#f8fbff] p-5 shadow-[inset_0_0_0_1px_rgba(191,219,254,0.55)]">
      <Icon className="h-5 w-5 text-[#1557c0]" />
      <p className="mt-5 text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
