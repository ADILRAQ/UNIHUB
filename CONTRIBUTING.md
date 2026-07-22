# Contributing to UniHub

This document defines how work happens in this repository. It is binding for every
contributor (human or agent) — see `CLAUDE.md` for the full project constitution.

## Repository structure

UniHub is a **monorepo**:

```
UNIHUB/
├── backend/     Spring Boot 3 (Java 21, Maven) API — lands in UNIH-11
├── frontend/    React + TypeScript + Vite app     — lands in UNIH-12
├── CLAUDE.md    Project constitution (stack, workflow rules, locked decisions)
└── CONTRIBUTING.md   This file
```

`backend/` and `frontend/` do not exist yet as of UNIH-10 (repo scaffolding). They are
introduced by their own stories (UNIH-11, UNIH-12) so that each PR stays scoped to one
story.

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
- A PR merges only with a **green CI build** (build-only CI lands in UNIH-15: `mvn
  verify` for the backend, `npm ci && npm run lint && npm run build` for the frontend).
  Until UNIH-15 lands, reviewers still gate merges manually on the same checks.
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

## Code style

- Backend: `controller → service → repository` layering; DTOs at every API boundary
  (never expose JPA entities); Flyway-only schema changes.
- Frontend: TypeScript, feature folders under `src/features/<domain>/`; ESLint +
  Prettier must pass (`npm run lint`).
- Formatting baseline for all file types is defined in `.editorconfig` — configure your
  editor to respect it.

See `CLAUDE.md` for the full set of locked technical decisions before starting any
story.
