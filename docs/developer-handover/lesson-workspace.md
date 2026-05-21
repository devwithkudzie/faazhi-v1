# Lesson Workspace

## Purpose

The Faazhi lesson workspace is the core learning experience. It is a focused, full-screen environment for scene-based lessons and assessments.

It uses its own shell instead of `AppShell` because normal app navigation would distract from learning mode.

## Shell Structure

```txt
LessonWorkspaceShell
├── LessonWorkspaceHeader
├── LessonTree
├── LearningCanvas / ScenePlayer
├── ContextDrawer
└── LessonWorkspaceFooter
```

## Layout

| Area | Purpose |
| --- | --- |
| Lesson header | Shows Faazhi, subject, paper, progress, exit/help/user actions. |
| Left lesson tree | Curriculum navigation for topics, lessons, topical assessments, module assessment. |
| Central learning canvas | Dominant scene player and checkpoint overlay area. |
| Footer controls | Transcript, notes, key takeaways, previous/next item. |
| Context drawer | Opens transcript, notes, or key takeaways without leaving the workspace. |

## Scene-Based Learning Model

Lessons are not plain pages. A lesson is a sequence of scenes:

```txt
Lesson
└── scenes[]
    ├── concept
    ├── example
    ├── diagram
    ├── interactive
    ├── checkpoint
    └── callout
```

Scenes are selected by timeline position and rendered by `SceneRenderer`.

## Embedded Assessments

Embedded assessments are scene-level interactions:

- appear during a lesson
- pause the player
- render above the player area
- use submit/retry/continue behavior
- continue returns the student to the scene flow

Use these for lightweight checks, not full assignments.

## Topical Assessments

Topical assessments live at the end of a topic. Current direction:

1. Student clicks topical assessment in the lesson tree.
2. Main canvas shows an assessment intro screen.
3. Student clicks Start.
4. Full-screen assessment overlay slides in.

Topical assessment is practice-style and should remain simpler than module papers.

## Module Assessments

Module assessments live at the end of the paper/module. Current direction:

- intro screen first
- timed full-paper overlay
- right-side question navigator
- dummy marking flow currently implemented
- future backend should persist attempts and marking

## Extending Scenes

To add a new scene type:

1. Add the scene type to `features/learn/types/scene.ts`.
2. Create a renderer component under `features/learn/components/scenes/`.
3. Update `SceneRenderer.tsx`.
4. Add sample data in `features/learn/data/sampleCurriculum.ts`.
5. Add backend schema support later when API-driven content is introduced.

