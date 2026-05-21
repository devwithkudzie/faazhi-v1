# Frontend Maintenance Guide

## Maintenance Principles

- Preserve feature boundaries.
- Keep route files thin.
- Keep workspace pages isolated from normal app shell behavior.
- Prefer typed content models over ad hoc objects.
- Refactor when a component loses a clear single purpose.

## Refactoring Rules

Refactor when:

- a file becomes too large
- a component has multiple unrelated modes
- data transformation is mixed with visual rendering
- repeated UI patterns appear in several places

Do not refactor unrelated areas while implementing a small feature.

## Avoid Large Files

A file can be large temporarily during exploration, but should be split once structure stabilizes.

Good split pattern:

```txt
components/assessment/
├── AssessmentIntroPanel.tsx
├── TopicalAssessmentWorkspace.tsx
├── QuestionNavigator.tsx
├── AssessmentResultPanel.tsx
└── AssessmentInput.tsx
```

## State Management Guidelines

Use local state for:

- UI toggles
- local form drafts
- player controls
- temporary demo data

Use URL state for:

- navigable sections
- selected resource IDs
- filters users might share

Use backend persistence for:

- attempts
- progress
- grades
- notes
- bookmarks
- curriculum content

## Testing Recommendations

Add tests around:

- scene timeline utilities
- content normalization
- assessment scoring
- route rendering
- role-based UI

Suggested layers:

| Layer | Tool |
| --- | --- |
| Unit | Vitest or Jest |
| Component | React Testing Library |
| E2E | Playwright |

## Common Mistakes To Avoid

- Putting product logic in `app/page.tsx`.
- Making shared components depend on feature types.
- Duplicating curriculum shapes in several files.
- Treating assessment attempts as frontend-only in production.
- Adding another global shell for workspace-only needs.
- Skipping responsive behavior for lesson workspace.

