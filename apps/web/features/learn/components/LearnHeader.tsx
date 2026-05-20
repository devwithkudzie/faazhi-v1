import { BookOpen } from "lucide-react";

export function LearnHeader({
  subjectId,
  paperId,
  courseTitle,
  isLoading,
}: {
  subjectId: string;
  paperId: string;
  courseTitle?: string;
  isLoading?: boolean;
}) {
  const paperName = paperId.replace("-", " ").toUpperCase();

  return (
    <div className="border-b border-border/50 bg-[#f5f7fb]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Computer Science {subjectId}
            </p>
            <h1 className="font-serif-paper text-2xl font-semibold text-foreground">
              Learn Workspace · {isLoading ? paperName : courseTitle ?? paperName}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
