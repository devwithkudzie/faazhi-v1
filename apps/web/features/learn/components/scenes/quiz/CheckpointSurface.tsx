import * as React from "react";

export function CheckpointSurface({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden bg-slate-950/35 p-6 backdrop-blur-[1px]">
      <div className="flex max-h-[82vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <div className="border-b border-slate-100 bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                Question
              </h2>
              <div className="mt-2 flex min-w-0 items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1557c0]">
                  <span className="flex h-4 w-4 items-center justify-center">
                    {icon}
                  </span>
                  {eyebrow}
                </span>
                <span className="truncate">{title}</span>
              </div>
            </div>

            <button
              type="button"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-2xl leading-none text-slate-700 transition hover:bg-slate-100"
              aria-label="Close checkpoint"
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
