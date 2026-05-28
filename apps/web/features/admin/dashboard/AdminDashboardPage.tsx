"use client";

import { Activity, BookOpenCheck, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CreateSubjectCard } from "@/features/admin/dashboard/components/CreateSubjectCard";
import { DraftSubjectsPanel } from "@/features/admin/dashboard/components/DraftSubjectsPanel";
import { PlatformStats } from "@/features/admin/dashboard/components/PlatformStats";
import { PublishedSubjectsPanel } from "@/features/admin/dashboard/components/PublishedSubjectsPanel";
import { RecentActivity } from "@/features/admin/dashboard/components/RecentActivity";
import { getAdminDashboardData } from "@/features/admin/dashboard/services/dashboard.service";
import { AdminShell } from "@/features/admin/shared/components/AdminShell";
import {
  mapApiSubject,
  type ApiSubject,
} from "@/features/admin/subjects/services/api-subjects";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";

interface DashboardResponse {
  stats: {
    students: number;
    subjects: number;
    publishedLessons: number;
    draftLessons: number;
    narrationFiles: number;
  };
  recentStudents: Array<{
    name: string;
  }>;
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const fallbackData = getAdminDashboardData();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    Promise.all([
      apiRequest<DashboardResponse>("/api/admin/dashboard", { token }),
      apiRequest<{ subjects: ApiSubject[] }>("/api/subjects", { token }),
    ])
      .then(([dashboardResult, subjectResult]) => {
        if (cancelled) return;
        setDashboard(dashboardResult);
        setSubjects(subjectResult.subjects);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function updateSubjectStatus(subjectId: string, status: "draft" | "published") {
    if (!token) return;

    await apiRequest(`/api/subjects/${subjectId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });

    const result = await apiRequest<{ subjects: ApiSubject[] }>("/api/subjects", {
      token,
    });
    setSubjects(result.subjects);
  }

  const metrics = useMemo(() => {
    if (!dashboard) return fallbackData.studentStats;

    return [
      {
        label: "Total students",
        value: dashboard.stats.students.toString(),
        change: "Signed up students",
        tone: "blue" as const,
        icon: Users,
      },
      {
        label: "Available subjects",
        value: dashboard.stats.subjects.toString(),
        change: `${publishedSubjectsFrom(subjects).length} published`,
        tone: "amber" as const,
        icon: BookOpenCheck,
      },
      {
        label: "Published lessons",
        value: dashboard.stats.publishedLessons.toString(),
        change: `${dashboard.stats.draftLessons} drafts`,
        tone: "green" as const,
        icon: Activity,
      },
      {
        label: "Narration files",
        value: dashboard.stats.narrationFiles.toString(),
        change: "Audio ready for lessons",
        tone: "slate" as const,
        icon: UserPlus,
      },
    ];
  }, [dashboard, fallbackData.studentStats, subjects]);

  const adminSubjects = subjects.map(mapApiSubject);
  const draftSubjects = adminSubjects.filter((subject) => subject.status === "draft");
  const publishedSubjects = adminSubjects.filter((subject) => subject.status === "published");
  const recentActivity = dashboard
    ? dashboard.recentStudents.map((student) => ({
        actor: student.name,
        action: "joined",
        target: "Faazhi",
        time: "recently",
      }))
    : fallbackData.recentActivity;

  return (
    <AdminShell>
      <main className="space-y-6 pb-8">
        <PlatformStats metrics={metrics} />

        <CreateSubjectCard />

        <div className="space-y-6">
          <DraftSubjectsPanel
            subjects={draftSubjects}
            onStatusChange={(subject) =>
              void updateSubjectStatus(subject.id, "published")
            }
          />
          <PublishedSubjectsPanel
            subjects={publishedSubjects}
            onStatusChange={(subject) =>
              void updateSubjectStatus(subject.id, "draft")
            }
          />
        </div>

        <RecentActivity items={recentActivity} />
      </main>
    </AdminShell>
  );
}

function publishedSubjectsFrom(subjects: ApiSubject[]) {
  return subjects.filter((subject) => subject.status === "published");
}
