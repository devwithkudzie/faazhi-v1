import type { AdminMetric } from "@/features/admin/dashboard/types/dashboard.types";
import { cn } from "@/shared/lib/utils";

const toneStyles = {
  blue: "bg-[#eaf2ff] text-[#1557c0]",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
};

export function MetricGrid({
  title,
  description,
  metrics,
}: {
  title: string;
  description: string;
  metrics: AdminMetric[];
}) {
  return (
    <section className="rounded-[28px] bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="rounded-3xl bg-slate-50/80 p-4 ring-1 ring-slate-200/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-2xl",
                    toneStyles[metric.tone],
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                  {metric.change}
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-slate-500">
                {metric.label}
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                {metric.value}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
