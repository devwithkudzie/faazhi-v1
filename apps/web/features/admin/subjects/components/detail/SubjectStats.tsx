import { BarChart3, BookOpenCheck, ClipboardCheck, Users } from "lucide-react";

import type { AdminSubject } from "@/features/admin/subjects/types/subject.types";

export function SubjectStats({ subject }: { subject: AdminSubject }) {
  const stats = [
    {
      label: "Students",
      value: subject.studentCount.toLocaleString(),
      icon: Users,
    },
    {
      label: "Lessons",
      value: subject.lessons.toString(),
      icon: BookOpenCheck,
    },
    {
      label: "Assessments",
      value: subject.assessments.toString(),
      icon: ClipboardCheck,
    },
    {
      label: "Average score",
      value: `${subject.averageScore}%`,
      icon: BarChart3,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.label}
            className="bg-white/90 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/70"
          >
            <div className="grid h-11 w-11 place-items-center bg-[#eaf2ff] text-[#1557c0]">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">
              {stat.label}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
              {stat.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}
