# Database Design Guide

## Suggested Entities

| Entity | Purpose |
| --- | --- |
| `users` | Student, teacher, admin accounts. |
| `roles` | Role definitions. |
| `subjects` | Cambridge subjects such as Computer Science 9618. |
| `modules` | Papers/modules under a subject. |
| `topics` | Topic groups under a paper. |
| `subtopics` | Lesson-level grouping if needed. |
| `scenes` | Scene data for learning playback. |
| `assessments` | Embedded, topical, and module assessments. |
| `questions` | Assessment questions. |
| `attempts` | Student submissions. |
| `progress` | Completion and mastery tracking. |
| `media_assets` | Video, image, audio, and generated media metadata. |
| `notes` | Student notes and saved insights. |

## Relationships

```txt
subject 1 -> many modules
module 1 -> many topics
topic 1 -> many lessons
lesson 1 -> many scenes
topic 1 -> many topical assessments
module 1 -> many module assessments
assessment 1 -> many questions
user 1 -> many attempts
user 1 -> many progress records
```

## Indexes

Add indexes for:

- foreign keys
- `subject.code`
- ordered curriculum fields
- `attempts.user_id`
- `attempts.assessment_id`
- `progress.user_id`
- `media_assets.storage_key`

## Soft Deletes

Use `deleted_at` for curriculum entities where accidental deletion is risky.

## Audit Fields

Recommended fields:

```txt
created_at
updated_at
deleted_at
created_by
updated_by
```

## Progress Tracking

Track progress at multiple levels:

- scene completed
- lesson completed
- topic completed
- assessment score
- module mastery

Example:

```txt
progress {
  user_id
  subject_id
  module_id
  topic_id
  lesson_id
  scene_id
  status
  score
  updated_at
}
```

