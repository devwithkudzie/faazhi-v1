import { CreateSubjectCard } from "@/features/admin/dashboard/components/CreateSubjectCard";
import { DraftSubjectsPanel } from "@/features/admin/dashboard/components/DraftSubjectsPanel";
import { PlatformStats } from "@/features/admin/dashboard/components/PlatformStats";
import { PublishedSubjectsPanel } from "@/features/admin/dashboard/components/PublishedSubjectsPanel";
import { RecentActivity } from "@/features/admin/dashboard/components/RecentActivity";
import { getAdminDashboardData } from "@/features/admin/dashboard/services/dashboard.service";
import { AdminShell } from "@/features/admin/shared/components/AdminShell";
import {
  getDraftSubjects,
  getPublishedSubjects,
} from "@/features/admin/subjects/services/subject.service";

export default function AdminDashboardPage() {
  const data = getAdminDashboardData();
  const draftSubjects = getDraftSubjects();
  const publishedSubjects = getPublishedSubjects();

  return (
    <AdminShell>
      <main className="space-y-6 pb-8">
        <section className="rounded-[32px] bg-white/88 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[#1557c0]">
                Overview
              </p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                Manage platform performance and subject publishing
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Create draft subjects from a starter template, review content
                status, and keep an eye on the platform signals that matter.
              </p>
            </div>

            <div className="grid min-w-[260px] grid-cols-2 gap-3 rounded-3xl bg-[#edf5ff] p-3">
              <div className="rounded-2xl bg-white p-3">
                <p className="text-xs font-semibold text-slate-500">
                  Completion rate
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#1557c0]">
                  64%
                </p>
              </div>
              <div className="rounded-2xl bg-white p-3">
                <p className="text-xs font-semibold text-slate-500">
                  Most active
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  CS 9618 · Paper 1
                </p>
              </div>
            </div>
          </div>
        </section>

        <PlatformStats metrics={data.platformStats} />

        <CreateSubjectCard />

        <div className="grid items-start gap-6 xl:grid-cols-2">
          <DraftSubjectsPanel subjects={draftSubjects} />
          <PublishedSubjectsPanel subjects={publishedSubjects} />
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
          <section className="rounded-[28px] bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
            <h2 className="text-lg font-semibold text-slate-950">
              Content management flow
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Create the subject first. Papers, topics, subtopics, scenes, and
              assessments are managed inside each subject workspace.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {["Subject", "Paper", "Topic", "Scene"].map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl bg-[#f5f9ff] p-4 ring-1 ring-blue-100"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1557c0] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <RecentActivity items={data.recentActivity} />
        </div>
      </main>
    </AdminShell>
  );
}
