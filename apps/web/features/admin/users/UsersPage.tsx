"use client";

import { useEffect, useMemo, useState } from "react";

import { MetricGrid } from "@/features/admin/dashboard/components/MetricGrid";
import { AdminShell } from "@/features/admin/shared/components/AdminShell";
import { userMetrics } from "@/features/admin/users/users.service";
import { apiRequest } from "@/shared/api/client";
import { useAuth } from "@/shared/providers/AuthProvider";

interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
  enrolledSubjectIds?: string[];
  subjectAccess?: Array<{
    subjectId: string;
    status: "trialing" | "active" | "expired" | "cancelled";
  }>;
  createdAt: string;
}

interface ApiSubject {
  id: string;
  name: string;
  code: string;
  isFree?: boolean;
}

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  new: "bg-amber-50 text-amber-700 ring-amber-100",
  quiet: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    Promise.all([
      apiRequest<{ users: ApiUser[] }>("/api/admin/users", { token }),
      apiRequest<{ subjects: ApiSubject[] }>("/api/subjects", { token }),
    ])
      .then(([userResult, subjectResult]) => {
        if (cancelled) return;
        setUsers(userResult.users);
        setSubjects(subjectResult.subjects);
      })
      .catch(() => {
        if (cancelled) return;
        setUsers([]);
        setSubjects([]);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const subjectLabels = useMemo(
    () =>
      new Map(
        subjects.map((subject) => [
          subject.id,
          `${subject.name} ${subject.code}`,
        ]),
      ),
    [subjects],
  );

  const students = users.filter((user) => user.role === "student");

  async function updateAccess(
    studentId: string,
    subjectId: string,
    status: string,
  ) {
    if (!token) return;

    await apiRequest(
      `/api/admin/users/${studentId}/subject-access/${subjectId}`,
      {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      },
    );

    const result = await apiRequest<{ users: ApiUser[] }>("/api/admin/users", {
      token,
    });
    setUsers(result.users);
  }

  return (
    <AdminShell>
      <main className="space-y-6 pb-8">
        <section className="bg-white/88 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
          <p className="text-sm font-semibold text-[#1557c0]">
            Student validation
          </p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            Users
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Track whether students are joining, returning, and completing
            lessons. Detailed roles and permissions can come later.
          </p>
        </section>

        <MetricGrid
          title="Student growth"
          description="Launch signals for signups, activity, and learning progress."
          metrics={userMetrics}
        />

        <section className="bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Students
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Recent students and their current learning progress.
              </p>
            </div>
            <div className="flex gap-2 text-xs font-semibold">
              <span className="bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-100">
                New
              </span>
              <span className="bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-100">
                Active
              </span>
              <span className="bg-slate-100 px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                Quiet
              </span>
            </div>
          </div>

          <div className="overflow-hidden border border-slate-200">
            <div className="grid grid-cols-[1.1fr_1.4fr_1.1fr_0.6fr] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              <span>Student</span>
              <span>Subject access</span>
              <span>Joined</span>
              <span>Progress</span>
            </div>

            {students.map((student) => {
              return (
              <div
                key={student.id}
                className="grid grid-cols-[1.1fr_1.4fr_1.1fr_0.6fr] items-center border-t border-slate-200 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-slate-950">
                      {student.name}
                    </p>
                    <span
                      className={[
                        "px-2 py-0.5 text-[11px] font-bold capitalize ring-1",
                        statusStyles.new,
                      ].join(" ")}
                    >
                      new
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {student.email}
                  </p>
                </div>
                <div className="grid gap-2">
                  {subjects.map((subject) => {
                    const access = student.subjectAccess?.find(
                      (item) => item.subjectId === subject.id,
                    );
                    const currentStatus = subject.isFree
                      ? "free"
                      : access?.status ?? "none";

                    return (
                      <div
                        key={`${student.id}-${subject.id}`}
                        className="grid grid-cols-[1fr_132px] items-center gap-2"
                      >
                        <span className="text-xs font-semibold text-slate-700">
                          {subjectLabels.get(subject.id) ?? subject.id}
                        </span>
                        {subject.isFree ? (
                          <span className="bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                            Free
                          </span>
                        ) : (
                          <select
                            value={currentStatus}
                            onChange={(event) =>
                              void updateAccess(
                                student.id,
                                subject.id,
                                event.target.value,
                              )
                            }
                            className="h-8 border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1557c0]"
                          >
                            <option value="none">No access</option>
                            <option value="trialing">Trial</option>
                            <option value="active">Subscribed</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-slate-600">{formatDate(student.createdAt)}</p>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      0%
                    </span>
                    <span className="text-xs text-slate-400">
                      0 lessons
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-slate-100">
                    <div
                      className="h-full bg-[#1557c0]"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </section>
      </main>
    </AdminShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
