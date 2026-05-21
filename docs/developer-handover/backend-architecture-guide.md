# Backend Architecture Guide

## Important Note

Ignore the current API implementation when designing the long-term backend. Build a fresh scalable backend using modular, domain-based architecture.

## Recommended Architecture

```txt
API layer
└── Controllers / Routes
    └── Services
        └── Repositories
            └── Database
```

Each domain owns its routes, validation, services, repositories, and tests.

## Recommended Domains

- auth
- users
- subjects
- curriculum
- lessons
- scenes
- assessments
- attempts
- progress
- notes
- media
- ai

## API Layer

Responsibilities:

- parse request
- authenticate user
- authorize action
- validate input
- call service
- return normalized response

Do not put business logic in controllers.

## Service Layer

Responsibilities:

- business rules
- orchestration between repositories
- scoring attempts
- progress updates
- permissions checks beyond route guards

## Repository Layer

Responsibilities:

- database reads/writes
- query composition
- transaction helpers

Repositories should not know HTTP concepts.

## Validation Layer

Use schema validation for every input:

- request body
- query params
- route params

Recommended libraries:

- Zod
- Valibot
- Joi

## Authentication And Authorization

Recommended roles:

- student
- teacher
- admin
- content_editor

Authorization examples:

| Action | Allowed |
| --- | --- |
| View enrolled subject | student enrolled in subject |
| Edit curriculum | admin/content_editor |
| Submit assessment attempt | student |
| View all attempts | teacher/admin |

## Database

Use migrations. Never manually change production schema.

Recommended relational database:

- PostgreSQL

Recommended ORM/query tools:

- Prisma
- Drizzle
- Kysely

## Error Handling

Use a consistent application error model:

```ts
throw new AppError("SUBJECT_NOT_FOUND", 404, "Subject not found");
```

Return machine-readable codes and human-readable messages.

## Logging

Log:

- request ID
- user ID
- route
- duration
- errors
- background jobs
- AI provider calls

Avoid logging sensitive student answers unless needed and protected.

## Testing

Required test types:

- unit tests for services
- repository integration tests
- API endpoint tests
- authorization tests
- assessment scoring tests

## Background Jobs

Use jobs for:

- media processing
- transcript generation
- AI feedback generation
- scheduled reminders
- attempt analytics

Possible tools:

- BullMQ
- Temporal
- pg-boss

## File And Media Handling

Use object storage:

- S3
- Cloudflare R2
- Supabase Storage

Store metadata in `media_assets`.

## AI Integration

Wrap AI providers behind an `ai` service. Do not call providers directly from controllers.

Use cases:

- feedback generation
- marking suggestions
- transcript summaries
- hint generation

## Caching And Rate Limiting

Cache:

- public curriculum reads
- media metadata
- subject listings

Rate-limit:

- auth endpoints
- assessment submission
- AI endpoints

## Environment Configuration

Use typed config and fail fast if required env vars are missing.

Important env groups:

- database
- auth/session
- storage
- AI providers
- email
- logging

## Deployment Considerations

- run migrations before deploy
- use health checks
- separate worker process for jobs
- monitor API latency and job failures
- back up database
- protect media buckets

