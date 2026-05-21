# Frontend File Structure

## Recommended Structure

```txt
apps/web/
├── app/
│   ├── layout.tsx
│   └── subjects/
│       ├── page.tsx
│       └── [subjectId]/
│           ├── page.tsx
│           └── learn/
│               └── [paperId]/
│                   └── page.tsx
│
├── features/
│   ├── subjects/
│   │   ├── SubjectsPage.tsx
│   │   ├── SubjectWorkspacePage.tsx
│   │   └── components/
│   │
│   └── learn/
│       ├── LearnWorkspacePage.tsx
│       ├── components/
│       ├── data/
│       ├── hooks/
│       ├── types/
│       └── utils/
│
└── shared/
    ├── components/
    ├── providers/
    ├── ui/
    └── lib/
```

## Naming Conventions

| Item | Convention | Example |
| --- | --- | --- |
| React components | PascalCase | `LessonWorkspaceShell.tsx` |
| Hooks | camelCase with `use` | `useScenePlayer.ts` |
| Types | PascalCase exported from feature `types/` | `Scene`, `LearnCurriculum` |
| Utilities | camelCase | `formatTime.ts` or `timeline.ts` |
| Feature page | PascalCase + `Page` | `SubjectsPage.tsx` |

## Where To Add Things

| Need | Location |
| --- | --- |
| New route | `app/.../page.tsx` |
| New feature page | `features/<feature>/<FeaturePage>.tsx` |
| Feature-specific component | `features/<feature>/components/` |
| Shared reusable component | `shared/components/` or `shared/ui/` |
| Feature hook | `features/<feature>/hooks/` |
| Feature type | `features/<feature>/types/` |
| Pure helper | `features/<feature>/utils/` or `shared/lib/` |

## Shared vs Feature-Specific Components

Create a shared component only when:

- it is used across multiple features
- it has no domain-specific assumptions
- it improves consistency without coupling features

Keep it feature-specific when:

- it references curriculum, scenes, papers, or assessments
- it exists only for one workflow
- it would make shared UI too domain-heavy

Example:

- `Button` belongs in `shared/ui`.
- `LessonTree` belongs in `features/learn/components/sidebar`.

