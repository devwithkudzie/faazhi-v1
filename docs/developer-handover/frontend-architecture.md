# Frontend Architecture

## Overview

The Faazhi frontend is a Next.js App Router application. Route files stay thin and delegate product behavior to feature modules.

The key architectural idea is:

```txt
app route -> feature page -> feature components/hooks/data/types
```

## App Router Structure

`apps/web/app/` contains route entry points. These files should mostly import and render feature-level pages.

Example:

```tsx
// apps/web/app/subjects/page.tsx
import SubjectsPage from "@/features/subjects/SubjectsPage";

export default function Page() {
  return <SubjectsPage />;
}
```

## Folder Roles

| Folder | Role |
| --- | --- |
| `app/` | Next.js App Router routes, layouts, route handlers. Keep route files thin. |
| `features/` | Product modules such as `learn` and `subjects`. Most business UI lives here. |
| `shared/` | Cross-feature UI, providers, layout, utilities. |
| `components/` | Component folders inside features. Prefer domain-specific grouping. |
| `data/` | Sample data, loaders, normalizers. Future API adapters can live here. |
| `hooks/` | Feature-specific React hooks. |
| `types/` | TypeScript types for feature data models. |
| `utils/` | Pure helpers and formatting functions. |

## Current Route Structure

Important routes include:

```txt
/subjects
/subjects/[subjectId]
/subjects/[subjectId]/learn
/subjects/[subjectId]/learn/[paperId]
/subjects/[subjectId]/papers
/subjects/[subjectId]/progress
```

## Normal Pages vs Focused Workspace Pages

Normal app pages use `AppShell`:

- shared header
- breadcrumbs
- normal page layout
- footer

Focused workspace pages, especially `/subjects/[subjectId]/learn/[paperId]`, use their own shell:

- no normal `AppShell`
- no site footer
- full-screen layout
- learning-specific header
- lesson tree
- central scene canvas
- footer controls
- contextual drawers

This separation is intentional. Learning mode has a different interaction model from dashboard pages.

## Feature Module Connections

Feature modules should own their own:

- page component
- data loading
- component tree
- hooks
- types
- utilities

Routes should not contain business logic. If a route becomes more than a small wrapper, move the logic into `features/`.

