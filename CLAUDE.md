# CLAUDE.md — UniHub Project Constitution

## What this project is
UniHub centralizes a university department's academic life in one app: announcements,
class calendar with Google Meet links, course resources & homework submissions, session
recaps for missed classes, and tuition payment tracking (3 installments with proof-image
validation). End-of-year student project.

Stack: Spring Boot 3 (Java 21, Maven) + React (TypeScript, Vite) + PostgreSQL + MinIO,
fully dockerized, CI/CD with GitHub Actions → Render/Railway.

## Jira is the source of truth
- Project **UNIH**: https://raqiouiadil852.atlassian.net/browse/UNIH
- Epics UNIH-1…UNIH-9 (UNIH-8 is **descoped** — no notifications/email in v1).
- **Epic descriptions contain binding decisions.** Before starting any story, read the
  story AND its parent epic's "Agreed decisions" section.
- A story is done only when **every acceptance criterion** is met.

## Locked technical decisions (do not change without team approval)

### Repository
- Monorepo: `backend/` (Spring Boot) + `frontend/` (React). GitHub, `main` protected.

### Backend
- Spring Boot 3, **Java 21**, **Maven**. Layers: `controller → service → repository`,
  plus `model`, `dto`, `config` packages.
- DTOs at every API boundary — never expose JPA entities in responses.
- Global exception handler returning a consistent error JSON shape.
- **Flyway only** for schema changes: add `V{next}__snake_case_description.sql` under
  `backend/src/main/resources/db/migration`. **Never edit an applied migration.**
- File storage through the MinIO storage service (S3 SDK) — no local filesystem paths.

### Security & auth
- Email + password login; **single JWT access token** (12–24h expiry), no refresh token.
- BCrypt password hashing. Roles: `STUDENT` / `TEACHER` / `ADMIN`; RBAC enforced on
  **every** endpoint (teachers scoped to their own courses/groups).
- Temp-password lifecycle per epic UNIH-2 (CSV bulk import, forced change at first login).
- Rich text (announcements, recap notes) is **sanitized server-side** (whitelist tags).
- Secrets only via environment variables. Never log credentials or tokens.

### Frontend
- React 18 + **TypeScript** + Vite. Feature folders: `src/features/<domain>/`.
- One typed API client (axios, base URL from `VITE_API_URL`); JWT attached automatically
  via request interceptor.
- Data fetching via **TanStack Query** — never ad-hoc `useEffect`/`useState` fetching.
  Reusable generic hooks in `src/hooks/`: `useGetData` (wraps `useQuery`), `useGetPaginatedData`
  (wraps `useInfiniteQuery`), `usePostData` (wraps `useMutation`). All feature code composes
  these instead of calling `useQuery`/`useMutation`/`useInfiniteQuery` directly.
- Role-based route guards; render only server-sanitized HTML.
- ESLint + Prettier must pass (`npm run lint`).

### Infra
- Local dev: `docker compose up` runs api + postgres + minio + frontend.
- CI: GitHub Actions on every push/PR — **build-only** (`mvn verify`, `npm ci && npm
  run lint && npm run build`). No test suite required in v1; if tests are added they
  run automatically.
- CD: merge to `main` → build Docker images → auto-deploy to Render/Railway.

### Product scope guards
- No attendance tracking. No notifications/emails. No online payment processing.
- Payments: 3 sequential installment slots — only the current slot accepts a proof
  upload; validation opens the next slot.

## Workflow rules (every agent, every story)
1. **One Jira story = one branch = one PR.** Branch name: `feature/UNIH-<n>-short-name`.
2. Never commit to `main`. A PR merges only with a green build.
3. Before coding: read the story + parent epic. After coding: list each acceptance
   criterion as a checkbox in the PR description and confirm it. Flag any deviation.
4. Conventional commits: `feat(UNIH-18): add JWT login endpoint`, `fix: …`, `chore: …`.
5. Keep the diff scoped to the story. Unrelated refactors = separate PR.
6. If a story changes setup steps, update README/CONTRIBUTING in the same PR.

## Commands
- Full stack: `docker compose up`
- Backend only: `cd backend && mvn spring-boot:run`
- Frontend only: `cd frontend && npm run dev`
- Lint: `cd frontend && npm run lint` · Build check: `cd backend && mvn verify`

## Domain glossary
- **Class group**: a cohort of students (e.g. "L3 Info A"); users belong to groups.
- **Course**: taught by one teacher to one class group; has a Meet link.
- **Schedule template**: weekly recurrence rule that generates **sessions**.
- **Session**: one dated occurrence of a course; can be cancelled/rescheduled; owns a
  **recap** (recording URL, notes, linked resources & assignments).
- **Module**: a folder of **resources** (files/links) inside a course.
- **Assignment / submission**: homework with a due date; one submission per student,
  late flag computed; resubmission replaces.
- **Payment period / installment**: 3 per academic year; statuses locked → unpaid →
  proof submitted → paid/rejected; overdue derived from due date.

## Agent team
The **main Claude Code session is the orchestrator**: it picks the next story from the
Jira board (respect epic order: 1 → 2 → 3/4/5 → 6/7 → 9 and story dependencies),
delegates to the right subagent, then runs the **reviewer** subagent on the diff before
any merge. Subagents (in `.claude/agents/`):
- `backend` — Spring Boot / Flyway / security stories
- `frontend` — React / TypeScript stories
- `devops` — Docker, CI/CD, cloud stories
- `reviewer` — read-only PR review against acceptance criteria (mandatory: this
  project has no automated tests, so review is the quality gate)

Delegate explicitly, e.g.: *"Use the backend subagent to implement UNIH-18."*
