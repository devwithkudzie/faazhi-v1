import { ReactNode } from "react";

import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";
import { Breadcrumbs } from "./Breadcrumbs";

export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f6f8fc_0%,#edf3f8_100%)]">
      <AppHeader />
      <Breadcrumbs />

      <main className="flex-1">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}
