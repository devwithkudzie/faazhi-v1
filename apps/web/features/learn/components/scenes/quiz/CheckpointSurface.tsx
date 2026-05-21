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
    <div className="flex h-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fbff_34%,#eef5ff_100%)] p-6">
      <div className="flex h-full max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[#bfdbfe] bg-white/96 shadow-[0_32px_90px_rgba(21,87,192,0.18)] backdrop-blur">
        
        {/* Header */}
        <div className="border-b border-slate-100 bg-white/80 px-7 py-5">
          <div className="flex items-center justify-between gap-6">
            
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1557c0]">
                <span className="flex h-4 w-4 items-center justify-center">
                  {icon}
                </span>

                {eyebrow}
              </div>

              <div className="h-5 w-px bg-slate-200" />

              <p className="text-sm font-medium text-slate-500">
                {title}
              </p>
            </div>

            {/* Right */}
            <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-600 md:flex">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />

              Workspace checkpoint
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}