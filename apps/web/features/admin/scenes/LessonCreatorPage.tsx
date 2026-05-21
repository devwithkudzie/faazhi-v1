import LessonStudioPage from "@/features/admin/studio/LessonStudioPage";
import {
  getAdminPaper,
  getAdminSubject,
} from "@/features/admin/subjects/services/subject.service";

export default function LessonCreatorPage({
  subjectId,
  paperId = "paper-1",
}: {
  subjectId: string;
  paperId?: string;
}) {
  const subject = getAdminSubject(subjectId);
  const paper = getAdminPaper(subjectId, paperId);

  return <LessonStudioPage paper={paper} subject={subject} />;
}
