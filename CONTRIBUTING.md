# Contributing to UniHub

This document defines how work happens in this repository. It is binding for every
contributor (human or agent) — see `CLAUDE.md` for the full project constitution.

## Repository structure

UniHub is a **monorepo**:

```
UNIHUB/
├── backend/          Spring Boot 3 (Java 21, Maven) API
├── frontend/         React + TypeScript + Vite app
├── docker-compose.yml   Orchestrates postgres + minio + api + frontend
├── .env.example      Documents every root-level environment variable
├── README.md         Setup, architecture diagram, project structure
├── CLAUDE.md         Project constitution (stack, workflow rules, locked decisions)
└── CONTRIBUTING.md   This file
```

See [README.md](./README.md) for the full project structure breakdown (backend package
layout, frontend feature folders, etc.) and zero-to-running setup instructions.

## Branching

- `main` is protected. Nobody commits to `main` directly.
- All work happens on a feature branch cut from `main`, named:

  ```
  feature/UNIH-<n>-short-name
  ```

  Example: `feature/UNIH-18-jwt-login`

- **One Jira story = one branch = one PR.** Do not mix multiple stories in one branch,
  and do not bundle unrelated refactors into a story's PR (open a separate PR for those).

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/), referencing the Jira
issue key in the scope where the commit implements a specific story:

```
feat(UNIH-18): add JWT login endpoint
fix: correct null check in health controller
chore: bump spring boot version
docs: update README setup steps
```

- `feat(UNIH-<n>): …` — new functionality for a story
- `fix: …` — bug fix (add `(UNIH-<n>)` scope if tied to a specific story)
- `chore: …` — tooling, config, dependency, infra changes
- `docs: …` — documentation-only changes

## Pull requests

- One Jira story = one branch = one PR (see above).
- The PR description must list **every acceptance criterion from the Jira story** as a
  checkbox and confirm whether it is met. Flag any deviation explicitly rather than
  silently dropping scope.
- A PR merges only with a **green CI build**. GitHub Actions (`.github/workflows/ci.yml`)
  runs on every push and PR against `main` with two jobs: `backend` (`mvn verify`) and
  `frontend` (`npm ci && npm run lint && npm run build`). CI is build-only — no test
  suite is required in v1, but any tests that are added run automatically as part of
  these jobs.
- Branch protection with required status checks (`backend`, `frontend`) should be
  enabled on `main` by a repo admin in GitHub → Settings → Branches, if not already
  configured, so PRs cannot merge while CI is red or still running.
- Never commit directly to `main` — always go through a PR.
- Every PR diff is reviewed by the project's `reviewer` subagent against the story's
  acceptance criteria before merge (see `CLAUDE.md` → "Agent team"). This is the
  project's quality gate in the absence of an automated test suite.

## Secrets and credentials

Secrets, API keys, and credentials must **always** live in a local `.env` file
(gitignored) and be injected as environment variables. They must **never** be
hardcoded in source files, config files, or committed to the repository — this is a
hard project rule with no exceptions. `.env.example` documents every variable a
contributor needs, with placeholder values only.

## Adding a database migration

Schema changes go through **Flyway only** — never edit an applied migration, and never
change the schema via `ddl-auto` or a manual SQL console.

1. Add a new file under `backend/src/main/resources/db/migration/` named:

   ```
   V{next}__snake_case_description.sql
   ```

   e.g. `V3__add_courses_table.sql` — bump `{next}` to one past the highest existing
   `V*` migration in that folder (check what's there before picking a number).
2. Write plain SQL (DDL/DML) in the file — Flyway applies migrations in version order.
3. Restart the backend (or `docker compose up`); Flyway runs pending migrations
   automatically on boot before the app accepts traffic.
4. Never modify or delete a migration that has already been merged to `main` — if a
   mistake shipped, add a new migration that corrects it.

## Code style

- Backend: `controller → service → repository` layering; DTOs at every API boundary
  (never expose JPA entities); Flyway-only schema changes.
- Frontend: TypeScript, feature folders under `src/features/<domain>/`; ESLint +
  Prettier must pass (`npm run lint`).
- Formatting baseline for all file types is defined in `.editorconfig` — configure your
  editor to respect it.

See `CLAUDE.md` for the full set of locked technical decisions before starting any
story.
