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
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <Breadcrumbs />

      <main className="flex-1">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}