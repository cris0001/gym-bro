# Project Roadmap

Estimated total: 8-10 weeks of focused work for MVP (Stages 0-10 + 2.5).

Stages 11-16 are post-MVP — optional polish, performance, a11y,
and full production deployment.

---

## MVP Scope (Stages 0-10 + Stage 2.5)

### Stage 0 — Monorepo setup (3-4 days)

Foundation for the entire project. All tooling, structure, CI
configured before writing any feature code.

- [ ] pnpm workspaces structure (apps/web, apps/api, packages/shared)
- [ ] Root package.json with workspace configuration
- [ ] TypeScript strict config (shared base, extended per app)
- [ ] Path aliases (@/ in web, @/ in api, @fit/shared)
- [ ] ESLint shared config (root + per-app extends)
- [ ] Prettier shared config
- [ ] Husky + lint-staged for pre-commit hooks
- [ ] Vitest setup in apps/web, apps/api, packages/shared
- [ ] GitHub Actions CI workflow (lint + typecheck + test on PR)
- [ ] .env.example files for apps/api
- [ ] README placeholder

---

### Stage 1 — Backend foundation + auth (4-5 days)

Get the API skeleton up with working authentication. Database
connection, first migrations, JWT in HttpOnly cookie.

- [ ] Hono app skeleton in apps/api
- [ ] Drizzle ORM setup
- [ ] Neon Postgres connection (free tier)
- [ ] Drizzle migrations infrastructure
- [ ] users table schema + first migration
- [ ] bcrypt password hashing utility
- [ ] jose JWT signing utility
- [ ] Auth service layer (register, login logic)
- [ ] Auth repository layer (user queries)
- [ ] POST /api/auth/register endpoint
- [ ] POST /api/auth/login endpoint (JWT in HttpOnly cookie)
- [ ] POST /api/auth/logout endpoint
- [ ] GET /api/auth/me endpoint (current user)
- [ ] Auth middleware for protected routes
- [ ] Global error handler middleware
- [ ] CORS configuration with credentials
- [ ] Vitest tests for auth service (pure logic)
- [ ] Integration test for at least register + login flow

---

### Stage 2 — Frontend foundation + auth flow (4-5 days)

Get the SPA running with working login. App shell, protected
routes, communication with API.

- [ ] Vite + React 19 + TypeScript strict setup
- [ ] Tailwind CSS v4 setup with CSS variables
- [ ] shadcn/ui initialization (`pnpm dlx shadcn@latest init`)
- [ ] Add base shadcn components (button, input, label, form, dialog)
- [ ] TanStack Router setup with route definitions
- [ ] TanStack Query setup with QueryClient configuration
- [ ] API client wrapper (fetch with credentials, error handling)
- [ ] Protected route handling (redirect to login if no auth)
- [ ] Login page with React Hook Form + Zod validation
- [ ] Register page with React Hook Form + Zod validation
- [ ] App shell layout (header with logout, main content area)
- [ ] Logout flow (clear cookie, redirect to login)
- [ ] Loading and error states for auth pages
- [ ] Empty dashboard placeholder ("Welcome, more coming soon")

---

### Stage 2.5 — Minimal README (30 minutes)

Quick win — give the repo context for anyone who finds it
mid-development.

- [ ] README with project description (2-3 sentences)
- [ ] Status badge: "Work in Progress"
- [ ] Tech stack list (concise)
- [ ] Roadmap checkboxes (synced with this file)
- [ ] Link to repo (no live demo yet)
- [ ] How to run locally (clone, install, env, dev commands)

---

### Stage 3 — Shared package (2-3 days)

Build the bridge between frontend and backend. Zod schemas
become the single source of truth for types and validation.

- [ ] packages/shared/package.json setup
- [ ] Workspace import working from apps/web and apps/api
- [ ] Auth schemas (RegisterSchema, LoginSchema, UserSchema)
- [ ] Training schemas (Exercise, TrainingPlan, WorkoutTemplate,
  WorkoutSession, Set, etc.)
- [ ] Nutrition schemas (Food, Recipe, FoodLog, DailyGoals)
- [ ] Weight schemas (WeightEntry)
- [ ] Constants exports (exercise categories enum, status enums)
- [ ] Inferred type exports for all schemas
- [ ] Refactor existing auth code to use shared schemas

---

### Stage 4 — Training backend (6-8 days)

Full CRUD for the training domain. Plans, templates, exercises,
template-exercise slots. All endpoints validated with Zod.

- [ ] training_plans table + migration
- [ ] workout_templates table + migration
- [ ] exercises table + migration
- [ ] workout_template_exercises table + migration
- [ ] TrainingPlan repository + service
- [ ] WorkoutTemplate repository + service
- [ ] Exercise repository + service
- [ ] TrainingPlan CRUD endpoints
- [ ] WorkoutTemplate CRUD endpoints (nested in plan)
- [ ] Exercise CRUD endpoints
- [ ] WorkoutTemplateExercise CRUD endpoints (slots in template)
- [ ] Soft delete logic (is_active flag) for exercises and plans
- [ ] Tests for each service
- [ ] Integration tests for happy paths

---

### Stage 5 — Training UI (8-12 days)

User-facing training management. Plans, templates, exercises
dictionary. Drag-and-drop reordering. Optimistic updates.

- [ ] Training plans list view
- [ ] Create/edit training plan form
- [ ] Training plan detail view (shows templates inside)
- [ ] Workout templates within plan: list, create, edit
- [ ] Exercise dictionary list view
- [ ] Create/edit exercise form (name + category from enum)
- [ ] Template builder: add exercises with target sets/reps
- [ ] Drag-and-drop reordering of exercises in template (dnd-kit)
- [ ] React Query hooks with optimistic updates for all CRUD
- [ ] Empty states for each list (clear CTAs)
- [ ] Loading skeletons
- [ ] Error states with retry
- [ ] Tests for key custom hooks

---

### Stage 6 — Calendar + workout sessions (8-12 days)

The heart of the app. Plan workouts on the calendar, execute
them, log sets with RIR, swap exercises during session.

- [ ] planned_sessions table + migration
- [ ] workout_sessions table + migration
- [ ] exercise_performances table + migration
- [ ] sets table + migration
- [ ] PlannedSession repository + service + endpoints
- [ ] WorkoutSession repository + service + endpoints
- [ ] Calendar view (week + month modes)
- [ ] Dropdown to assign template to date (grouped by plan)
- [ ] Drag-and-drop to reschedule planned sessions
- [ ] "Start workout" flow (creates WorkoutSession from PlannedSession)
- [ ] Ad-hoc workout flow (start from template without planning)
- [ ] Active session UI: list of exercises, set logging
- [ ] Set logging form (weight, reps, RIR optional, completed)
- [ ] Exercise swap modal (filters to same category)
- [ ] Track original_exercise_id vs actual_exercise_id
- [ ] Session notes textarea
- [ ] Per-exercise notes
- [ ] Finish workout flow (set finished_at, calculate summary)
- [ ] Workout history list
- [ ] Workout history detail view
- [ ] Zustand store for in-progress session (draft state)

---

### Stage 7 — Training stats (3-4 days)

Visualize progress over time. Pure aggregation functions
testable in isolation.

- [ ] Aggregation functions (pure): max weight per exercise,
  total volume per session, weekly volume, etc.
- [ ] Backend endpoints for aggregated data
- [ ] Progress chart per exercise (Recharts line chart)
- [ ] Volume chart (weekly bars)
- [ ] Exercise selector for charts
- [ ] Memoization where measured to actually help (with comments)
- [ ] Vitest tests for all aggregation functions

---

### Stage 8 — Nutrition backend (5-7 days)

CRUD for foods, recipes (with macro auto-calculation), daily
food log, daily goals.

- [ ] foods table + migration
- [ ] recipes table + migration
- [ ] recipe_ingredients table + migration
- [ ] food_log table + migration
- [ ] daily_goals table + migration
- [ ] Food repository + service + endpoints
- [ ] Recipe repository + service (with auto-macro calculation)
- [ ] Recipe endpoints (CRUD + auto-calculated macro response)
- [ ] FoodLog repository + service + endpoints (per-day queries)
- [ ] DailyGoals repository + service + endpoints
- [ ] Pure functions for macro calculation (testable)
- [ ] Tests for macro calculation logic

---

### Stage 9 — Nutrition UI (8-12 days)

Food dictionary, recipe builder, daily diary, goals settings.
The most complex UI module of the app.

- [ ] Food dictionary list view with search
- [ ] Create/edit food form (name, brand, per-100g macros)
- [ ] Recipe list view
- [ ] Recipe builder: select foods, set amounts, see live macros
- [ ] Recipe detail with macro breakdown per serving
- [ ] Daily diary view (today by default, date picker for history)
- [ ] Add food/recipe to diary (search + amount input)
- [ ] Remove food from diary
- [ ] Daily summary (kcal/B/F/C totals)
- [ ] Goals settings page (kcal, protein, fat, carbs targets)
- [ ] Progress bars: consumed vs goal per macro
- [ ] Empty states for each view
- [ ] Tests for key hooks and pure functions

---

### Stage 10 — Weight tracking (3-4 days)

Simple module: log weight, see trend over time, basic statistics.

- [ ] weight_entries table + migration with UNIQUE(user_id, date)
- [ ] WeightEntry repository + service + endpoints
- [ ] Add weight form (date defaults to today, weight_kg, notes)
- [ ] Weight entries list (paginated or virtualized if many)
- [ ] Edit/delete entries
- [ ] Trend chart with raw data points (Recharts)
- [ ] Overlay: 7-day moving average line
- [ ] Overlay: 30-day moving average line
- [ ] Stats panel: current weight, change last 7d, change last 30d,
  total change from first entry
- [ ] Date range selector for chart
- [ ] Pure functions for moving averages (tested)

---

## MVP Complete

After Stage 10, the app has all three modules functional.
This is the minimum to call portfolio-ready.

Stages 11-16 are polish — important for a great portfolio piece,
but the app works without them.

---

## Post-MVP (Stages 11-16)

Optional polish phase. Do these after MVP done.

### Stage 11 — Unified dashboard (2-3 days)
- [ ] Today's workout card (if planned)
- [ ] Daily calories consumed vs goal
- [ ] Latest weight + weekly trend
- [ ] Streak counter (days with logged activity)
- [ ] Parallel data fetching with useQueries
- [ ] Skeleton states per section

### Stage 12 — Performance pass (3-4 days)
- [ ] React DevTools Profiler audit on key views
- [ ] Virtualization for long lists (react-window)
- [ ] Memoization where measured to help
- [ ] Code splitting per route
- [ ] Lighthouse audit on all pages — target 95+
- [ ] Bundle analysis (vite-bundle-visualizer)
- [ ] Before/after metrics documented in README

### Stage 13 — Accessibility pass (2-3 days)
- [ ] Keyboard navigation everywhere
- [ ] Focus management for modals (focus trap)
- [ ] ARIA labels and aria-live for toasts
- [ ] Contrast check WCAG AA
- [ ] Screen reader test on key flows
- [ ] Skip links
- [ ] Reduced motion support

### Stage 14 — Polish + animations + responsive (3-4 days)
- [ ] Comprehensive empty states with illustrations or CTAs
- [ ] Consistent error states with retry actions
- [ ] Loading skeletons everywhere
- [ ] Smooth transitions (transform/opacity only)
- [ ] Mobile-first responsive design pass
- [ ] Toast notification system
- [ ] Confirm dialogs for destructive actions
- [ ] Dark mode polish

### Stage 15 — Production deployment (1-2 days)
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Fly.io
- [ ] Configure production env vars
- [ ] GitHub Actions auto-deploy on main
- [ ] Verify cookies work cross-origin (CORS + SameSite)
- [ ] Demo account creation script
- [ ] Smoke test on production

### Stage 16 — Full documentation (3-4 days)
- [ ] README rewrite with screenshots, demo link, full stack details
- [ ] ARCHITECTURE.md with diagrams (mermaid or excalidraw)
- [ ] DECISIONS.md finalized (this file)
- [ ] CONTRIBUTING.md (placeholder for now)
- [ ] Demo account credentials prominently displayed
- [ ] GIFs of key flows
- [ ] Performance metrics screenshots
- [ ] Architecture diagram

---

## Future considerations (not in scope)

Things documented as roadmap but explicitly NOT in MVP:

- OAuth (Google, GitHub) instead of email/password
- Open Food Facts API integration with caching layer
- Body measurements (biceps, chest, waist, hip circumference)
- Multi-language UI (i18n with react-i18next)
- Mobile app (React Native or PWA)
- Workout sharing or social features
- Exercise atlas with images/videos
- AI-generated workout suggestions
- Wearables integration (Apple Health, Google Fit)
- Barcode scanner for food entry
- Meal planning (weekly meal prep with shopping list)
- Macro cycling / refeed days
- Periodization (deload weeks marked in plan)