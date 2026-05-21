import { SubjectPanel } from "@/features/admin/dashboard/components/SubjectPanel";
import type { AdminSubject } from "@/features/admin/subjects/types/subject.types";

export function PublishedSubjectsPanel({
  subjects,
}: {
  subjects: AdminSubject[];
}) {
  return (
    <SubjectPanel
      title="Published subjects"
      description="Subjects currently visible on the student side."
      subjects={subjects}
    />
  );
}
