# Curriculum Content Model

## Hierarchy

Faazhi learning content should follow:

```txt
Subject
└── Paper / Module
    └── Topic
        └── Subtopic / Lesson
            └── Scene
```

Example:

```txt
Computer Science 9618
└── Paper 1
    └── Information Representation
        └── Number systems
            ├── concept scene
            ├── diagram scene
            ├── try-it scene
            └── checkpoint scene
```

## Supported Scene Types

| Type | Use |
| --- | --- |
| `concept` | Introduce a concept. |
| `example` | Worked example. |
| `video` | Real video or generated media. |
| `diagram` | Visual explanation. |
| `interactive` | Try It style interaction. |
| `code` | Pseudocode or programming demonstration. |
| `checkpoint` | Embedded assessment in a lesson. |
| `reflection` | Guided thinking prompt. |
| `quiz` | Question-based interaction. |
| `simulation` | Interactive model or sandbox. |
| `callout` | Examiner tip, warning, or insight. |

## Assessment Levels

| Level | Location | Purpose |
| --- | --- | --- |
| Embedded assessment | Inside scenes | Lightweight learning checks. |
| Topical assessment | End of topic | Practice assignment for topic mastery. |
| Module assessment | End of paper/module | Timed full-paper assessment. |

## Data-Driven Content

Scene data should be JSON-compatible:

```json
{
  "id": "binary-intro",
  "type": "concept",
  "title": "What is binary?",
  "duration": 70,
  "narration": "Binary is base two...",
  "captions": [],
  "blocks": []
}
```

## Normalization

Before rendering, API content should be normalized:

- ensure IDs exist
- sort topics/lessons/scenes by order
- fill missing optional arrays
- validate scene type
- resolve media assets
- compute durations
- map assessment data to renderable question models

Normalization should happen in data loaders or backend services, not inside visual components.

