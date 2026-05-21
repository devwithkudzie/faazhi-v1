# Backend Development Guide

## New Module Workflow

Follow this order:

1. Create schema/model.
2. Create migration.
3. Create repository.
4. Create service.
5. Create validation schema.
6. Create controller/route.
7. Add tests.
8. Document endpoint.

## Example: Subject Module

### 1. Schema

```ts
subjects {
  id
  code
  title
  level
  created_at
  updated_at
}
```

### 2. Repository

```ts
export class SubjectRepository {
  findById(id: string) {}
  listForUser(userId: string) {}
}
```

### 3. Service

```ts
export class SubjectService {
  constructor(private subjects: SubjectRepository) {}

  async getSubjectForUser(userId: string, subjectId: string) {
    return this.subjects.findById(subjectId);
  }
}
```

### 4. Route

```txt
GET /api/v1/subjects
GET /api/v1/subjects/:subjectId
```

## Example: Lesson Module

### Schema

```ts
lessons {
  id
  topic_id
  title
  kind
  order_index
}

scenes {
  id
  lesson_id
  type
  payload_json
  duration_seconds
  order_index
}
```

### Service Responsibilities

- load lesson with scenes
- normalize scene payloads
- check user access
- update progress when completed

### Route

```txt
GET /api/v1/subjects/:subjectId/modules/:moduleId/lessons/:lessonId
```

## Testing

For every module:

- repository tests for queries
- service tests for business rules
- endpoint tests for HTTP behavior
- authorization tests for restricted actions

