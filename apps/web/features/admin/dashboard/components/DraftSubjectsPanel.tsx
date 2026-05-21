import { SubjectPanel } from "@/features/admin/dashboard/components/SubjectPanel";
import type { AdminSubject } from "@/features/admin/subjects/types/subject.types";

export function DraftSubjectsPanel({ subjects }: { subjects: AdminSubject[] }) {
  return (
    <SubjectPanel
      title="Draft subjects"
      description="Workspaces still hidden from students until published."
      subjects={subjects}
    />
  );
}
