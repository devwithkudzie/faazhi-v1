# Faazhi Admin Frontend Map

The admin area follows a route-thin, feature-heavy structure.

## Where Routes Live

`apps/web/app/admin/**` contains Next.js App Router files only. These files should stay small and simply render the matching feature page.

Example:

```tsx
import AdminDashboardPage from "@/features/admin/dashboard/AdminDashboardPage";

export default function Page() {
  return <AdminDashboardPage />;
}
```

## Where Admin UI Lives

`apps/web/features/admin/**` contains the real admin implementation.

```txt
features/admin/
├── dashboard/        Admin home, stats, draft/published panels
├── subjects/         Subject list, creation, landing/editor pieces
├── shared/           Admin shell, aside, and reusable admin-only helpers
├── papers/           Future paper/module management
├── topics/           Future topic management
├── subtopics/        Future subtopic management
├── scenes/           Lesson creator, scene builder, and preview tools
├── assessments/      Future assessment authoring
├── media/            Future media library
└── analytics/        Future admin analytics
```

## Current Admin Flow

The first content-management action is intentionally only:

```txt
Create Subject
```

Creating a subject produces a draft starter structure:

```txt
Subject draft
└── Paper 1 draft
    └── Getting Started draft
        └── Introduction draft
            └── Welcome Scene draft
```

Papers, topics, subtopics, and scenes should be managed inside the subject editor after a subject exists.

## Editing Guide

| Need to update | Go to |
| --- | --- |
| Admin home dashboard layout | `features/admin/dashboard/AdminDashboardPage.tsx` |
| Dashboard sample metrics/activity | `features/admin/dashboard/services/dashboard.service.ts` |
| Create subject card/modal | `features/admin/dashboard/components/CreateSubjectCard.tsx` |
| Subject list page | `features/admin/subjects/SubjectListPage.tsx` |
| Subject creation page | `features/admin/subjects/SubjectCreatePage.tsx` |
| Subject landing/editor page | `features/admin/subjects/SubjectEditorPage.tsx` |
| Subject landing panels | `features/admin/subjects/components/detail/` |
| Subject form fields | `features/admin/subjects/components/SubjectForm.tsx` |
| Starter template preview | `features/admin/subjects/components/StarterTemplatePreview.tsx` |
| Draft/published status badge | `features/admin/subjects/components/PublishStatusBadge.tsx` |
| Lesson creator page | `features/admin/scenes/LessonCreatorPage.tsx` |
| Lesson creator components | `features/admin/scenes/components/` |
| Admin aside/header shell | `features/admin/shared/components/AdminShell.tsx` |

## Route To Feature Map

| Route | Feature page |
| --- | --- |
| `/admin` | `features/admin/dashboard/AdminDashboardPage.tsx` |
| `/admin/subjects` | `features/admin/subjects/SubjectListPage.tsx` |
| `/admin/subjects/new` | `features/admin/subjects/SubjectCreatePage.tsx` |
| `/admin/subjects/[subjectId]` | `features/admin/subjects/SubjectEditorPage.tsx` |
| `/admin/subjects/[subjectId]/learn` | Redirects to `/admin/subjects/[subjectId]/papers/paper-1/learn` |
| `/admin/subjects/[subjectId]/papers/[paperId]/learn` | `features/admin/scenes/LessonCreatorPage.tsx` |
