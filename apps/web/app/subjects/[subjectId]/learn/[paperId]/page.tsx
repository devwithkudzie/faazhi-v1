import LearnWorkspacePage from "@/features/learn/LearnWorkspacePage";

export default async function Page({
  params,
}: {
  params: Promise<{ subjectId: string; paperId: string }>;
}) {
  const { subjectId, paperId } = await params;

  return <LearnWorkspacePage subjectId={subjectId} paperId={paperId} />;
}
