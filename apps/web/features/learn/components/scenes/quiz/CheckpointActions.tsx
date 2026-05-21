import * as React from "react";

export function CheckpointActions({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
      {children}
    </div>
  );
}
