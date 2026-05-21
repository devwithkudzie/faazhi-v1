# Backend File Structure

## Recommended Structure

```txt
apps/api/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── db/
│   │   ├── migrations/
│   │   ├── schema/
│   │   └── seed/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── subjects/
│   │   ├── curriculum/
│   │   ├── lessons/
│   │   ├── assessments/
│   │   ├── attempts/
│   │   ├── progress/
│   │   ├── media/
│   │   └── ai/
│   ├── middleware/
│   ├── shared/
│   ├── jobs/
│   └── tests/
```

## Module Structure

```txt
modules/subjects/
├── subject.routes.ts
├── subject.controller.ts
├── subject.service.ts
├── subject.repository.ts
├── subject.schema.ts
├── subject.validators.ts
└── subject.test.ts
```

## Folder Responsibilities

| Folder | Purpose |
| --- | --- |
| `config/` | Typed environment and app configuration. |
| `db/` | Database client, schema, migrations, seeds. |
| `modules/` | Domain modules. |
| `middleware/` | Auth, request ID, error handling, rate limits. |
| `shared/` | Shared errors, response helpers, logger, utilities. |
| `jobs/` | Background worker jobs and queues. |
| `tests/` | Test helpers and integration setup. |

## Adding A New Module

1. Create folder under `modules/`.
2. Add route file.
3. Add controller.
4. Add service.
5. Add repository.
6. Add validator/schema.
7. Add tests.
8. Register routes in app bootstrap.

