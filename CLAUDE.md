# Fitness Tracker — Project Context

## What this is
Personal portfolio project. Web app combining strength training,
nutrition tracking (macros only), and weight tracking in one app.
Built to demonstrate mid/senior frontend skills for 2026 job market.

## Single-user app
Not multi-tenant SaaS. Designed for personal use + demo account for recruiters.

## Stack — committed decisions

### Monorepo
- pnpm workspaces with apps/web, apps/api, packages/shared
- Conventional Commits (feat:, fix:, chore:, refactor:, test:, docs:)
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
- dnd-kit for drag and drop
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
- Constants (exercise categories, statuses)

## Architecture rules

### Frontend
- Feature-based folder structure (Bulletproof React style)
- Each feature folder: api/, hooks/, components/, types.ts, index.ts
- ONLY exports go through index.ts
- Components max 150 lines — refactor if larger
- TanStack Query for ALL fetches — no manual fetch in components
- Zustand ONLY for local UI state, NOT duplicating server data
- Custom hook for each domain logic piece
- Discriminated unions for loading states

### Backend
- Layered: routes → services → repositories
- Routes: validate with Zod + delegate to service
- Services: pure business logic
- Repositories: Drizzle queries only
- Custom error classes + global error handler
- Consistent response shape: { data: T } or { error: { message, code } }

### Shared
- Zod schemas exported from packages/shared/schemas
- Backend uses them to validate request bodies
- Frontend infers types via z.infer<typeof Schema>
- Type safety end-to-end

## UI Component Library

Using **shadcn/ui** — copy-paste component system built on Radix UI
primitives + Tailwind CSS. Components live in the project source,
not as an npm dependency.

### Setup
- Initialize via `pnpm dlx shadcn@latest init` in apps/web
- Add components via `pnpm dlx shadcn@latest add button dialog input`
- Components copied to `apps/web/src/components/ui/`
- Tailwind config and CSS variables managed by shadcn init

### Rules
- shadcn primitives live in `apps/web/src/components/ui/`
- DO NOT manually edit shadcn files unless intentionally customizing —
  if customized, document why in a comment at top of file
- Custom domain components live in `apps/web/src/components/`
  or in feature folders (e.g., `features/training/components/`)
- Domain components COMPOSE shadcn primitives — they don't rebuild them
- All styling via Tailwind classes (no CSS modules, no styled-components)
- Theme via CSS variables (shadcn manages this in globals.css)

### Component composition pattern
- ui/ = shadcn primitives (Button, Dialog, Input, Select, etc.)
- components/ = shared domain-agnostic components (EmptyState,
  ConfirmDialog, DataTable) built FROM ui/ primitives
- features/*/components/ = domain-specific components (ExerciseCard,
  WorkoutBuilder) built FROM components/ + ui/

### Folder structure
```
apps/web/src/
├── components/
│   ├── ui/              # shadcn primitives (avoid manual edits)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── confirm-dialog.tsx   # custom composed components
│   ├── empty-state.tsx
│   └── data-table.tsx
└── features/
    └── training/
        └── components/
            ├── exercise-card.tsx
            └── workout-builder.tsx
```

### Dark mode
- shadcn supports dark mode via CSS variables out of the box
- Theme stored via Zustand store with localStorage persistence
- Apply theme by toggling `class="dark"` on `<html>` element

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
- DO NOT generate pre-seeded foods or exercises — user adds own

## Language
- ALL code, comments, commit messages: English
- ALL UI labels: English
- User-generated content (exercise names, food names, recipe names,
  workout names, notes): user's choice, app is agnostic

## Domain model overview

### Training
- TrainingPlan (user can have multiple): "PPL", "Upper/Lower" etc.
- WorkoutTemplate (within plan): "Push", "Pull", "Legs"
- Exercise (user dictionary): "Bench Press" with category
- Categories (enum): Chest, Back, Legs, Shoulders, Biceps,
  Triceps, Abs, Cardio, Other
- PlannedSession (calendar): user assigns template to date
- WorkoutSession (actual execution): with sets, RIR (0-5 nullable), notes
- Exercise swap during session: keep original_exercise_id + actual_exercise_id

### Nutrition
- Food (user dictionary): name, brand, kcal/protein/fat/carbs per 100g
- Recipe: list of foods with amounts, auto-calculated macros
- FoodLog: daily diary, references food or recipe with amount
- DailyGoals: kcal, protein, fat, carbs targets

### Weight
- WeightEntry: date + weight_kg + notes (one per day, UNIQUE constraint)

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

### Conventional commit prefixes (when suggesting)
- feat: new feature
- fix: bug fix
- chore: tooling, deps, config
- refactor: code change without feature/fix
- test: adding/updating tests
- docs: documentation only
- perf: performance improvement
- style: formatting, no logic change

### When user is ready to commit, Claude can help by
- Running `git status` and `git diff` to show what changed
- Suggesting commit message based on changes
- Running the commit only after user confirms message

## Current stage
Stage 0: Monorepo setup and tooling.