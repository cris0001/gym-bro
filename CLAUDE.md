# Gym Bro — Project Context

## What this is

Personal fitness tracker — a web app combining strength training,
nutrition tracking (macros only), and body measurements in one tool.
Built for daily personal use at the gym and tracking nutrition.

## Single-user app

Not multi-tenant SaaS. Designed for personal use + demo account.

## Stack — committed decisions

### Monorepo

- pnpm workspaces with apps/web, apps/api, packages/shared
- Conventional Commits (feat:, fix:, chore:, refactor:, test:, docs:, ci:)
- Husky + lint-staged for pre-commit hooks
- ESLint + Prettier shared config

### Frontend (apps/web)

- React 19
- Vite (NOT Next.js — intentional SPA choice)
- TypeScript strict — ZERO `any`
- TanStack Query v5 — for ALL server state
- Zustand v5 — ONLY for local UI state (modals, drafts, filters)
- TanStack Router v1 — type-safe routing
- Tailwind CSS v4 with CSS variables for theming
- shadcn/ui for component primitives
- React Hook Form + Zod
- Recharts for charts
- dnd-kit for drag and drop (with touch support)
- date-fns for date manipulation
- Vitest + Testing Library + MSW for tests
- Playwright for 2-3 e2e flows

### Backend (apps/api)

- Hono (NOT Express)
- Node.js 22 LTS
- Drizzle ORM (NOT Prisma)
- PostgreSQL via Neon (serverless, free tier)
- Zod for request validation
- jose for JWT
- bcrypt for passwords

### Shared (packages/shared)

- Zod schemas as single source of truth
- Inferred TypeScript types
- Constants (exercise categories, statuses, enums)

## Working style — SMALL CHUNKS

The user prefers SMALL, INCREMENTAL changes over large batches.
This is non-negotiable and applies throughout the project.

### Rules

- ONE FILE PER STEP when creating or significantly editing files
- After each file (or small focused change), STOP and summarize
  what you did, then WAIT for user approval before continuing
- Don't chain multiple file creations even if logically related —
  ask "want me to continue with X, or review this first?"
- For trivial edits (typo fix, single-line change), batching 2-3 is OK
- Suggest commit checkpoints every 2-3 related file completions

### Why

Small chunks make reviews manageable, commits atomic, and ensure
each change can be understood and verified in isolation.

### What this looks like in practice

- "Here's apps/api/src/db/schema/users.ts — review and let me know
  before I continue with the migration"
- "Created auth.service.ts. Want me to proceed with auth.repository.ts
  or review service first?"
- NOT: "I created the schema, repository, service, and route in one go"

## Decisions requiring user input

For ANY non-trivial architectural or design decision, DO NOT decide
unilaterally. Stop and present options.

### When to ask

- Database schema design (tables, columns, relationships, constraints)
- API endpoint design (URL structure, request/response shape, errors)
- State management decisions (Zustand vs Query vs local state)
- Component architecture (compound vs props vs render prop)
- Folder/file structure decisions not already documented
- Library choices not committed in CLAUDE.md
- Trade-offs between approaches (performance vs simplicity, etc.)
- Naming conventions for new concepts

### How to ask

Present 2-3 viable options with:

1. What each option means concretely
2. Pros and cons of each
3. Your recommendation with reasoning
4. What you'd choose by default if user doesn't respond

Format example:

```
For workout session storage, I see two approaches:

**Option A: Single table with nullable fields**
- workout_sessions has template_id (nullable), session_type enum
- Pros: simpler queries, one source of truth
- Cons: many nullable fields, harder to validate at DB level

**Option B: Separate tables for strength vs cardio**
- strength_sessions and cardio_sessions, joined by interface
- Pros: cleaner schema per type, easier validation
- Cons: more code, harder to query "all sessions"

My recommendation: A — most fitness apps grow into hybrid types
(circuit training, supersets), and a single table handles this
better. The nullable fields are well-defined by session_type.

Want me to go with A, or do you prefer B?
```

### Database schema specifically — extra caution

Before writing ANY Drizzle code for new tables, propose the schema
as plain text first:

1. Table name
2. Each column: name, type, nullable, default, why
3. Constraints (UNIQUE, FK, CHECK)
4. Relationships to other tables
5. Example row
6. Pseudo-queries for main use cases (proves the schema works)

User reviews → approves → THEN you write Drizzle code.

## Architecture rules

### Folder structure — feature-based co-location

The user wants FULL co-location: every feature folder contains
EVERYTHING that feature needs in its own subfolders (components,
hooks, api, types, utils, stores). Shared code only goes to
root-level folders when used across 2+ features.

### Frontend feature folder structure

Each feature in `apps/web/src/features/<name>/` uses these subfolders
(only create what's actually needed):

- `api/` — API client functions
- `components/` — feature-specific components
- `hooks/` — custom hooks for this feature
- `stores/` — Zustand stores (if needed)
- `types/` — feature types (often inferred from shared)
- `utils/` — feature pure functions
- `index.ts` — PUBLIC exports (the only thing imported elsewhere)

### Example — auth feature

```
apps/web/src/features/auth/
├── api/
│   ├── login.ts
│   ├── register.ts
│   └── me.ts
├── components/
│   ├── login-form.tsx
│   └── register-form.tsx
├── hooks/
│   └── use-current-user.ts
├── types/
│   └── index.ts
└── index.ts
```

Other features (training, nutrition, body, dashboard, onboarding)
follow the same structure.

### Shared frontend code at root level (apps/web/src/)

- `app/` — routing root, providers, router config
- `components/ui/` — shadcn primitives
- `components/` — domain-agnostic shared components (used by 2+ features)
- `hooks/` — shared hooks (used by 2+ features)
- `lib/` — infrastructure (api-client, query-client, utils)
- `stores/` — shared Zustand stores
- `utils/` — shared pure functions

### Backend feature folder structure

Each feature in `apps/api/src/features/<name>/` has these files:

- `<name>.routes.ts` — Hono route handlers (thin, validate + delegate)
- `<name>.service.ts` — business logic
- `<name>.repository.ts` — Drizzle queries
- `<name>.utils.ts` — optional feature helpers

### Example — auth feature (backend)

```
apps/api/src/features/auth/
├── auth.routes.ts
├── auth.service.ts
└── auth.repository.ts
```

### Shared backend code at root level (apps/api/src/)

- `db/schema/` — Drizzle schemas split per domain
- `db/migrations/` — generated by drizzle-kit
- `db/client.ts` — db client export
- `middleware/` — shared Hono middleware (auth, error, cors)
- `lib/` — shared utilities (jwt, password, errors, env)
- `index.ts` — app entry — assembles routes

### Shared package structure (packages/shared/src/)

- `schemas/` — Zod schemas, one file per domain
- `types/` — inferred types via z.infer
- `constants/` — enums, fixed values
- `index.ts` — public exports

### Frontend rules

- Feature folder MUST have at minimum: api/, components/, index.ts
- Other subfolders (hooks/, stores/, types/, utils/) only if needed
- index.ts is the ONLY public interface — never import from feature internals
  - GOOD: `import { LoginForm } from '@/features/auth'`
  - BAD: `import { LoginForm } from '@/features/auth/components/login-form'`
- Components max 150 lines — refactor if larger
- TanStack Query for ALL fetches — no manual fetch in components
- Zustand ONLY for local UI state, NOT duplicating server data
- Custom hook for each domain logic piece
- Discriminated unions for loading states
- One component per file, named exports only

### Backend rules

- Feature module MUST have: routes, service, repository as separate files
- Layered architecture: routes → services → repositories
  - Routes: validate request with Zod, delegate to service, format response
  - Services: ALL business logic, NO Drizzle calls
  - Repositories: ONLY Drizzle queries, return plain objects
- Routes are THIN — if more than ~20 lines of logic, move to service
- Custom error classes in lib/errors.ts, all extending base AppError
- Global error handler middleware converts errors to consistent responses
- Consistent response shape: { data: T } for success,
  { error: { message, code } } for errors

### Shared package rules

- Zod schemas in schemas/, ONE file per domain
- Types derived from schemas via z.infer<typeof Schema>, NEVER hand-written
- Backend validates request bodies with these schemas
- Frontend uses inferred types for forms and React Query types
- Type safety end-to-end — same source of truth on both sides

### Cross-cutting rules

- NO circular dependencies between features
- Features can import from: shared package, components/, hooks/, lib/, utils/, stores/
- Features CANNOT import from other features (use shared if needed)
- Backend features can import from: shared, db, lib, middleware
- One concern per file

### File naming conventions

- ALL file names: kebab-case
  - Components: `login-form.tsx`, `exercise-card.tsx`
  - Hooks: `use-current-user.ts`, `use-debounce.ts`
  - Utils: `format-date.ts`, `calculate-bmi.ts`
  - Backend: `auth.service.ts`, `user.repository.ts`, `auth.routes.ts`
  - Schemas: `auth.schema.ts`, `training.schema.ts`
  - Stores: `auth-ui.store.ts`, `workout-draft.store.ts`
- EXCEPTION: configuration files keep fixed names
  (`tsconfig.json`, `vite.config.ts`, `package.json`, etc.)
- Inside files (exports):
  - Components: PascalCase (`export function LoginForm`)
  - Hooks: camelCase starting with `use` (`export function useCurrentUser`)
  - Functions: camelCase (`export function formatDate`)
  - Classes: PascalCase (`export class UserRepository`)
  - Types / Interfaces: PascalCase (`type UserId`, `interface AuthService`)
  - Constants: SCREAMING_SNAKE_CASE (`export const MAX_RETRIES = 3`)
- Named exports only — no default exports

## UI Component Library

Using **shadcn/ui** — copy-paste component system built on Radix UI
primitives + Tailwind CSS. Components live in the project source.

### Setup

- Initialize via `pnpm dlx shadcn@latest init` in apps/web
- Add components via `pnpm dlx shadcn@latest add button dialog input`
- Components copied to `apps/web/src/components/ui/`

### Rules

- shadcn primitives live in `apps/web/src/components/ui/`
- DO NOT manually edit shadcn files unless intentionally customizing —
  if customized, document why in a comment at top of file
- Custom domain components live in `apps/web/src/components/`
  or in feature folders
- Domain components COMPOSE shadcn primitives — they don't rebuild them
- All styling via Tailwind classes (no CSS modules, no styled-components)
- Theme via CSS variables (shadcn manages this in globals.css)

### Dark mode

- shadcn supports dark mode via CSS variables out of the box
- Theme stored via Zustand store with localStorage persistence
- Apply theme by toggling `class="dark"` on `<html>` element

## Mobile-first design

This app will be used heavily on mobile devices (at the gym, logging
meals on-the-go). Mobile is the PRIMARY target, desktop is secondary.

### Design principles

- Mobile-first CSS: base styles for mobile, scale UP for tablet/desktop
  using Tailwind responsive prefixes (sm:, md:, lg:)
- Touch targets: minimum 44×44px tap areas (Apple HIG / Material guidelines)
- Thumb-reachable zones: critical actions in the bottom 2/3 of the screen
- One-handed use: avoid requiring two-handed interactions where possible
- No hover-dependent UI: hover states are progressive enhancement
- Forms: large inputs, appropriate keyboard types (numeric for weight,
  email keyboard for email, etc.)

### Layout patterns

- Single column on mobile, multi-column on larger screens
- Bottom navigation OR top header — not both
- Modal sheets slide from bottom on mobile (use shadcn Sheet component)
- Long lists: virtualized or paginated to prevent scroll exhaustion

### During workouts specifically

- The active workout view must work one-handed (gym setting)
- Large, clear weight/reps inputs
- Easy +/- buttons rather than typing where it makes sense
- Quick swap exercise: minimal taps from active view
- Auto-save sets — no "save" button to forget pressing between sets

### Testing on mobile

- Use Chrome DevTools device emulation during development
- Test on actual phone before considering a feature done
- Lighthouse mobile audit (Stage 12) — target 90+ scores on mobile

## What NOT to do

- NO Axios — use native fetch
- NO Express — using Hono
- NO Prisma — using Drizzle
- NO Next.js — using Vite + React (SPA)
- NO `any` in TypeScript
- NO default exports (prefer named)
- NO generic comments like "// fetch data from API"
- NO enterprise patterns (no DI containers, no decorators)
- NO scope creep beyond current stage
- NO seed data for normal users (empty app for them)
- NO pre-defined exercises, foods, or workout tags
- NO internationalization in MVP — UI is English-only
- NO product images in MVP
- NO OAuth in MVP — email/password with JWT only
- NO desktop-first design — always start from mobile
- NO unilateral architectural decisions — ask user first
- NO running migrations without explicit user confirmation
- NO chaining multiple files in one step — ONE FILE PER STEP

## Language

- ALL code, comments, commit messages: English
- ALL UI labels: English
- User-generated content (exercise names, food names, recipe names,
  workout names, tag names, notes): user's choice, app is agnostic

## Domain model overview

### Onboarding

After first login, user sees an optional onboarding form. All fields
can be skipped and edited later in Settings:

- Birthdate, sex, height — stored on user profile (static)
- Current weight — first entry in body measurements history
- Daily nutrition targets (kcal + macros) — first entry in nutrition
  targets history

### Training

- TrainingPlan: user can have multiple plans (e.g., "PPL", "Upper/Lower")
- WorkoutTemplate: a day within a plan ("Push", "Pull", "Legs")
- Exercise: user dictionary with category. App starts empty.
- Categories (closed enum): Chest, Back, Legs, Shoulders, Biceps,
  Triceps, Abs, Cardio, Other
- PlannedSession: user assigns a template to a date (calendar)
- WorkoutSession: actual execution
  - Strength sessions: based on a template, with sets (weight × reps ×
    optional RIR 0-5)
  - Ad-hoc sessions: standalone activity log (cardio, yoga, sports) —
    no template, no exercises, just name + duration + notes
- Exercise swap during session: keep BOTH original_exercise_id and
  actual_exercise_id
- Finish workout: optional star rating (1-5) and optional tags
- Workout tags: user-defined labels with colors. App starts with no tags.
  Tags displayed on calendar as colored markers. Many tags per session.

### Nutrition

- Food: user dictionary with macros per 100g. App starts empty.
- Recipe: list of foods with amounts, auto-calculated macros.
- FoodLog: daily diary entries — food or recipe + amount
- Nutrition targets: HISTORICAL, not a single goals row. Each change
  creates new entry with today's date. "Current target" = most recent
  entry. Allows charting how targets changed over time.

### Body measurements

- Primary: weight (kg) and body fat (%)
- Optional advanced: biceps, chest, waist, hip, thigh (cm)
- All historical — one entry per day max, edits replace
- All fields optional within an entry
- UI shows weight prominently; advanced measurements behind
  "Show more" expandable section

### Charts and stats

- Body measurements trends with moving averages (7-day, 30-day)
- Per-exercise progress (max weight, total volume over time)
- Workout rating trend
- Nutrition targets history
- Streak counter on dashboard

### Settings

- Profile: email, password change, static user data (birthdate, sex, height)
- Targets: edit current nutrition target (creates new history entry)
- Tags: CRUD workout tags

## Auth

- Email + password
- bcrypt for hashing
- JWT in HttpOnly cookie via jose
- Demo account: filled manually at the end, not seeded programmatically

## Commit policy — MANUAL CONTROL

DO NOT commit automatically. The user controls all commits.

### Rules for Claude Code

- NEVER run `git commit` without explicit user request
- NEVER run `git add` of multiple files without showing what's being staged
- After completing work, summarize what changed and STOP — wait for user
- If user asks "commit this", suggest a conventional commit message but
  let user approve or modify before running
- Format suggestions as: `feat(training): add exercise CRUD endpoints`
- After completing a logical chunk of work, PROACTIVELY suggest
  this is a good checkpoint for a commit, with a suggested message.
- A "logical chunk" = one focused thing done (e.g., "users schema",
  "auth service file") — not the whole feature.

### Conventional commit prefixes (when suggesting)

- feat: new feature
- fix: bug fix
- chore: tooling, deps, config
- refactor: code change without feature/fix
- test: adding/updating tests
- docs: documentation only
- perf: performance improvement
- style: formatting, no logic change
- ci: CI/CD changes

### When user is ready to commit, Claude can help by

- Running `git status` and `git diff` to show what changed
- Suggesting commit message based on actual changes
- Running the commit only after user confirms message

## Decision explanations

For every non-trivial choice, briefly explain WHY in 1-3 sentences:

- Pick between viable alternatives → state choice + reasoning
- Non-obvious pattern or config → explain what it does
- Trade-offs → name them
- Trivial stuff (naming, basic syntax) → skip explanation

This keeps the codebase maintainable — every architectural decision
should be understandable from reading the code and surrounding context,
not require tribal knowledge.

## Database migrations — extra caution

Migrations can destroy data. Rules:

- NEVER run `pnpm drizzle-kit push` or migration commands without
  explicit user permission for each run
- ALWAYS show the generated SQL before running
- For destructive operations (DROP, ALTER COLUMN that loses data),
  warn explicitly and recommend backup first
- Migrations are run by USER, not Claude. Claude only generates them.

## Current stage

Stage 4: training backend (apps/api)
Drizzle schemas + migrations for the training domain (plans, templates,
exercises, template-exercises, tags), then the training feature module
(routes/service/repository) with full CRUD validated by Zod.

(Stage 3 — shared package — complete: the @gym-bro/shared package hosts
the auth Zod schemas, inferred types, and SEX_OPTIONS as the single source
of truth; both apps consume it. Per-domain schemas land with their build
stages, so training/nutrition/body Zod schemas are added in Stages 4/8/10
alongside their tables. Stage 2 complete; Stage 2.5 README skipped — full
README lands in Stage 16.)
