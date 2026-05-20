import LearnWorkspacePage from "@/features/learn/LearnWorkspacePage";

export default async function Page({
  params,
}: {
  params: Promise<{ subjectId: string; paperId: string }>;
}) {
  await params;

  return <LearnWorkspacePage />;
}
