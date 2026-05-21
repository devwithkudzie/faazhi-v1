import SubjectEditorPage from "@/features/admin/subjects/SubjectEditorPage";

export default async function Page({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;

  return <SubjectEditorPage subjectId={subjectId} />;
}
