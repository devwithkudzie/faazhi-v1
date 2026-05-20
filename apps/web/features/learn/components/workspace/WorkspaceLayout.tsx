import type { ReactNode } from "react";

export function WorkspaceLayout({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <section className="h-[calc(100vh-7rem)] overflow-hidden bg-[#f3f6fb]">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
        {sidebar}
        <main className="relative min-h-0 overflow-hidden">{children}</main>
      </div>
    </section>
  );
}
