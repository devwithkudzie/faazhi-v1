"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Lock, Sparkles } from "lucide-react";

import { AppShell } from "@/shared/components/layout/AppShell";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";
import { Button } from "@/shared/ui/button";

type AccessStatus =
  | "free"
  | "trialing"
  | "active"
  | "expired"
  | "cancelled"
  | "locked";

interface ExploreSubject {
  id: string;
  code: string;
  name: string;
  description: string;
  isFree: boolean;
  lessonCount: number;
  theme: {
    accent: string;
    canvasBackground: string;
  };
  access: {
    status: AccessStatus;
    hasAccess: boolean;
    label: string;
    trialEndsAt?: string;
    currentPeriodEndsAt?: string;
  };
}

export default function ExplorePage() {
  const { token, user } = useAuth();
  const [subjects, setSubjects] = useState<ExploreSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySubjectId, setBusySubjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    apiRequest<{ subjects: ExploreSubject[] }>("/api/explore/subjects", {
      token,
    })
      .then((result) => {
        if (!cancelled) setSubjects(result.subjects);
      })
      .catch(() => {
        if (!cancelled) setSubjects([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function refreshSubjects() {
    if (!token) return;

    const result = await apiRequest<{ subjects: ExploreSubject[] }>(
      "/api/explore/subjects",
      { token },
    );
    setSubjects(result.subjects);
  }

  const accessibleCount = subjects.filter((subject) => subject.access.hasAccess)
    .length;

  async function startTrial(subjectId: string) {
    if (!token) return;

    setBusySubjectId(subjectId);

    try {
      await apiRequest(`/api/subjects/${subjectId}/trial`, {
        method: "POST",
        token,
      });
      await refreshSubjects();
    } catch {
      setSubjects([]);
    } finally {
      setBusySubjectId(null);
    }
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white/88 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Welcome{user?.name ? `, ${user.name}` : ""}
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                Explore subjects
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Discover subjects, open the free Computer Science course, or
                start a trial for paid subjects when you are ready.
              </p>
            </div>

            <div className="bg-[#eaf2ff] px-4 py-3 text-sm font-semibold text-[#1557c0]">
              {loading ? "Loading..." : `${accessibleCount} active for you`}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard icon={Sparkles} label="Free subject" value="Computer Science" />
          <StatCard icon={Clock} label="Trial length" value="7 days" />
          <StatCard icon={BookOpen} label="Available subjects" value={loading ? "..." : subjects.length.toString()} />
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <article
              key={subject.id}
              className="bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: subject.theme.accent }}
                  >
                    {subject.code}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {subject.name}
                  </h2>
                </div>

                <span className={accessBadgeClass(subject.access.status)}>
                  {subject.access.label}
                </span>
              </div>

              <p className="mt-5 min-h-12 text-sm leading-6 text-slate-600">
                {subject.description}
              </p>

              <div className="mt-5 flex items-center gap-3 text-sm text-slate-500">
                <BookOpen className="h-4 w-4" />
                <span>{subject.lessonCount} lessons ready</span>
              </div>

              <div className="mt-7">
                {subject.access.hasAccess ? (
                  <Button
                    asChild
                    className="w-full bg-[#1557c0] text-white hover:bg-[#124aa3]"
                  >
                    <Link href={`/subjects/${subject.id}`}>
                      Open subject <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : subject.access.status === "locked" ? (
                  <Button
                    type="button"
                    onClick={() => void startTrial(subject.id)}
                    disabled={busySubjectId === subject.id}
                    className="w-full bg-[#1557c0] text-white hover:bg-[#124aa3]"
                  >
                    {busySubjectId === subject.id ? "Starting..." : "Start free trial"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-[#bfdbfe] text-[#1557c0]"
                  >
                    <Lock className="h-4 w-4" /> Subscribe to unlock
                  </Button>
                )}
              </div>
            </article>
          ))}
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
    <div className="bg-white/88 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/70">
      <Icon className="h-5 w-5 text-[#1557c0]" />
      <p className="mt-4 text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function accessBadgeClass(status: AccessStatus) {
  const base = "px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ring-1";

  if (status === "free") return `${base} bg-emerald-50 text-emerald-700 ring-emerald-100`;
  if (status === "active") return `${base} bg-blue-50 text-[#1557c0] ring-blue-100`;
  if (status === "trialing") return `${base} bg-amber-50 text-amber-700 ring-amber-100`;
  if (status === "expired") return `${base} bg-rose-50 text-rose-700 ring-rose-100`;

  return `${base} bg-slate-100 text-slate-600 ring-slate-200`;
}
