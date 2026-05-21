import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;

  redirect(`/admin/subjects/${subjectId}/papers/paper-1/learn`);
}
