# API Design Guide

## REST Conventions

Use nouns, not verbs:

```txt
GET /api/v1/subjects
GET /api/v1/subjects/:subjectId
POST /api/v1/assessments/:assessmentId/attempts
```

## Response Format

Success:

```json
{
  "data": {},
  "meta": {}
}
```

List:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

## Error Format

```json
{
  "error": {
    "code": "SUBJECT_NOT_FOUND",
    "message": "Subject not found",
    "details": {}
  }
}
```

## Pagination

Use:

```txt
?page=1&pageSize=20
```

For large feeds, cursor pagination can be added:

```txt
?cursor=abc123&limit=20
```

## Filtering And Sorting

```txt
GET /api/v1/subjects?level=cambridge-a-level
GET /api/v1/attempts?assessmentId=123&sort=-createdAt
```

## Versioning

Use URL versioning:

```txt
/api/v1
```

## Authentication Headers

```txt
Authorization: Bearer <token>
```

## Role-Based Access

Check permissions in middleware and services.

Example:

```txt
admin: manage curriculum
content_editor: edit lessons
student: view enrolled content, submit attempts
teacher: view assigned students
```

## Naming

Use stable resource names:

- `subjects`
- `modules`
- `topics`
- `lessons`
- `scenes`
- `assessments`
- `attempts`
- `progress`

