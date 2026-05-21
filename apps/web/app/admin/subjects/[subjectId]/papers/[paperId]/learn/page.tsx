import LessonCreatorPage from "@/features/admin/scenes/LessonCreatorPage";

export default async function Page({
  params,
}: {
  params: Promise<{ subjectId: string; paperId: string }>;
}) {
  const { subjectId, paperId } = await params;

  return <LessonCreatorPage subjectId={subjectId} paperId={paperId} />;
}
