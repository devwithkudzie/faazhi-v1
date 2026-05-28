import type { ActivityItem } from "@/features/admin/dashboard/types/dashboard.types";

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <section className="bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Student activity
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Recent signups, starts, submissions, and completions.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.actor}-${item.time}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="grid h-9 w-9 place-items-center bg-[#eaf2ff] text-xs font-bold text-[#1557c0]">
                {item.actor
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              {index < items.length - 1 && (
                <span className="mt-2 h-8 w-px bg-slate-200" />
              )}
            </div>
            <div className="min-w-0 pb-3">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-950">{item.actor}</span>{" "}
                {item.action}{" "}
                <span className="font-semibold text-slate-950">{item.target}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
