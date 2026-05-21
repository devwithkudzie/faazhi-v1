import { AdminShell } from "@/features/admin/shared/components/AdminShell";
import { StarterTemplatePreview } from "@/features/admin/subjects/components/StarterTemplatePreview";
import { SubjectHero } from "@/features/admin/subjects/components/detail/SubjectHero";
import { SubjectManagementPanel } from "@/features/admin/subjects/components/detail/SubjectManagementPanel";
import { SubjectPapersPanel } from "@/features/admin/subjects/components/detail/SubjectPapersPanel";
import { SubjectStats } from "@/features/admin/subjects/components/detail/SubjectStats";
import { getAdminSubject } from "@/features/admin/subjects/services/subject.service";

export default function SubjectEditorPage({
  subjectId,
}: {
  subjectId: string;
}) {
  const subject = getAdminSubject(subjectId);

  return (
    <AdminShell>
      <main className="space-y-6 pb-8">
        <SubjectHero subject={subject} />
        <SubjectStats subject={subject} />

        <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
          <SubjectPapersPanel subject={subject} />
          <div className="space-y-6">
            <SubjectManagementPanel subject={subject} />
            <StarterTemplatePreview items={subject.starterTemplate} />
          </div>
        </div>
      </main>
    </AdminShell>
  );
}
