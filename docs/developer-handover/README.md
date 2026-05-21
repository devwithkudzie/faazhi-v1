# Faazhi Developer Handover

## Project Overview

Faazhi is a scene-based multimedia learning platform for Cambridge exam mastery. It is being shaped as a focused academic workspace where students learn through structured subject pathways, cinematic lesson scenes, embedded checkpoints, and PaperLab-style digital assessments.

Faazhi is not a traditional LMS, PDF viewer, or notes app. The product direction is:

- multimedia-first learning
- scene-based lessons
- Cambridge syllabus progression
- paper/module-based mastery
- digital exam practice
- revision-ready notes, transcripts, and insights

## Main Goals

| Goal | Meaning |
| --- | --- |
| Cambridge mastery | Content should map clearly to subjects, papers, topics, and assessments. |
| Focused learning workspace | Lesson mode should reduce normal app navigation and keep attention on learning. |
| Scene-based engine | Lessons are rendered from scene data rather than hard-coded page layouts. |
| Digital papers | Assessments should feel like real structured exam papers in digital form. |
| Scalable architecture | The codebase should support more subjects, media, AI tools, and backend data. |

## High-Level Architecture

The current frontend is a Next.js App Router application organized around feature modules:

```txt
apps/web/
├── app/
├── features/
│   ├── learn/
│   └── subjects/
└── shared/
```

The current lesson workspace uses sample frontend data while the product direction moves toward API/database-driven curriculum content.

The backend should be rebuilt or evolved using a modular domain architecture. See:

- [backend-architecture-guide.md](./backend-architecture-guide.md)
- [backend-file-structure.md](./backend-file-structure.md)
- [database-design-guide.md](./database-design-guide.md)

## Who This Documentation Is For

This handover is for:

- frontend developers continuing the Next.js app
- backend developers designing the scalable API
- product-minded engineers adding curriculum and assessment workflows
- future maintainers onboarding to Faazhi

## How To Read This Documentation

Recommended order:

1. Read this overview.
2. Read [frontend-architecture.md](./frontend-architecture.md).
3. Read [lesson-workspace.md](./lesson-workspace.md) to understand the core product experience.
4. Read [curriculum-content-model.md](./curriculum-content-model.md) before changing learning data.
5. Read backend guides before building the production API.
6. Use [handover-checklist.md](./handover-checklist.md) when transferring ownership.

