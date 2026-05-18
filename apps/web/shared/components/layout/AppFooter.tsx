import Link from "next/link";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-semibold text-foreground">
            Faazhi
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Modern exam preparation workspace.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-5 text-sm">
          <Link
            href="/subjects"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Subjects
          </Link>

          <Link
            href="/subjects/9618/learn"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Learn
          </Link>

          <Link
            href="/subjects/9618/papers"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            PaperLab
          </Link>

          <Link
            href="/subjects/9618/progress"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Progress
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground">
          © {currentYear} Faazhi
        </p>
      </div>
    </footer>
  );
}