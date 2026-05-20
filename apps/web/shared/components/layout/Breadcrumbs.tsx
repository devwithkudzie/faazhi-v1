"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

const labelMap: Record<string, string> = {
  subjects: "My Learning",
  learn: "Learn",
  papers: "PaperLab",
  playground: "Playground",
  progress: "Progress",
  admin: "Admin",
  "9618": "Computer Science 9618",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = labelMap[segment] ?? decodeURIComponent(segment);

    return { href, label };
  });

  return (
    <nav className="bg-background">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm sm:px-6 lg:px-8">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <Home className="h-4 w-4" />
        </Link>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <div key={crumb.href} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />

              {isLast ? (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
