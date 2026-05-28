import { SubjectPanel } from "@/features/admin/dashboard/components/SubjectPanel";
import type { AdminSubject } from "@/features/admin/subjects/types/subject.types";

export function PublishedSubjectsPanel({
  subjects,
  onStatusChange,
}: {
  subjects: AdminSubject[];
  onStatusChange?: (subject: AdminSubject) => void;
}) {
  return (
    <SubjectPanel
      title="Published subjects"
      description="Subjects currently visible on the student side."
      subjects={subjects}
      onStatusChange={onStatusChange}
    />
  );
}
