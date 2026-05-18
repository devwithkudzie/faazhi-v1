import SubjectWorkspacePage from "@/features/subjects/SubjectWorkspacePage";

export default async function Page({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;

  return <SubjectWorkspacePage subjectId={subjectId} />;
}