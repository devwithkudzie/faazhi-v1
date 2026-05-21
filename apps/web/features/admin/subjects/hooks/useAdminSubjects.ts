import {
  getDraftSubjects,
  getPublishedSubjects,
} from "@/features/admin/subjects/services/subject.service";

export function useAdminSubjects() {
  return {
    draftSubjects: getDraftSubjects(),
    publishedSubjects: getPublishedSubjects(),
  };
}
