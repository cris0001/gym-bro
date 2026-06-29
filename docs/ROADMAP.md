# Project Roadmap

Estimated total: 9-11 weeks of focused work for MVP (Stages 0-10 + 2.5).

Stages 11-16 are post-MVP — optional polish, performance, a11y,
and full production deployment.

---

## MVP Scope (Stages 0-10 + Stage 2.5)

### Stage 0 — Monorepo setup ✅ COMPLETE

- [x] pnpm workspaces structure (apps/web, apps/api, packages/shared)
- [x] Root package.json with workspace configuration
- [x] TypeScript strict config (shared base, extended per app)
- [x] Path aliases (@/ in web, @/ in api, @gym-bro/shared)
- [x] ESLint shared config (root + per-app extends)
- [x] Prettier shared config
- [x] Husky + lint-staged for pre-commit hooks
- [x] Vitest setup in apps/web, apps/api, packages/shared
- [x] GitHub Actions CI workflow (lint + typecheck + test on PR)
- [x] .env.example files for apps/api
- [x] README placeholder

---

### Stage 1 — Backend foundation + auth ✅ COMPLETE

Get the API skeleton up with working authentication. Database
connection, first migrations, JWT in HttpOnly cookie. Users table
includes optional profile fields.

- [x] Hono app skeleton in apps/api
- [x] Drizzle ORM setup
- [x] Neon Postgres connection (free tier)
- [x] Drizzle migrations infrastructure
- [x] users schema with optional profile fields
      (birthdate, sex, height_cm) + first migration
- [x] bcrypt password hashing utility (lib/password.ts)
- [x] jose JWT signing utility (lib/jwt.ts)
- [x] Custom error classes (lib/errors.ts)
- [x] Global error handler middleware
- [x] Auth feature module:
  - [x] auth.repository.ts
  - [x] auth.service.ts
  - [x] auth.routes.ts
- [x] POST /api/auth/register endpoint
- [x] POST /api/auth/login endpoint (JWT in HttpOnly cookie)
- [x] POST /api/auth/logout endpoint
- [x] GET /api/auth/me endpoint
- [x] PATCH /api/auth/me endpoint (update profile fields)
- [x] Auth middleware for protected routes
- [x] CORS configuration with credentials
- [x] Vitest tests for auth service
- [x] Integration test for register + login flow

---

### Stage 2 — Frontend foundation + auth flow + onboarding ✅ COMPLETE

Get the SPA running with working login. Mobile-first design from day one.

- [x] Vite + React 19 + TypeScript strict setup
- [x] Tailwind CSS v4 setup with CSS variables
- [x] Mobile-first responsive setup (base mobile, sm/md/lg)
- [x] shadcn/ui initialization
- [x] Add base shadcn components (button, input, label, form, card,
      sheet for mobile modals) — dialog deferred; Sheet covers modals
- [x] TanStack Router setup with route definitions (file-based,
      pathless `_auth`/`_app` layout groups)
- [x] TanStack Query setup with QueryClient configuration
- [x] API client wrapper (lib/api-client.ts)
- [x] Protected route handling (beforeLoad guard + queryClient context)
- [x] Auth feature module (login/register components, hooks, api)
- [x] Login page
- [x] Register page
- [x] Onboarding feature: optional fields modal after first login
  - [x] Backend: onboarded_at column + migration
  - [x] Backend: POST /api/auth/onboarding endpoint + tests
  - [x] Frontend: bottom-sheet form (birthdate, sex, height)
- [x] App shell layout (mobile-first)
- [x] Logout flow
- [x] Loading and error states
- [x] Empty dashboard placeholder

---

### Stage 2.5 — Minimal README [SKIPPED — full README done in Stage 16 after MVP]

Skipped intentionally: a placeholder README has no real audience
mid-development. The full README (description, screenshots, demo link)
is written in Stage 16, once the MVP is complete.

---

### Stage 3 — Shared package ✅ COMPLETE

The shared package and the source-of-truth pattern are in place via auth.
Per-domain schemas land with their build stages (when their tables are
designed) rather than being guessed up front:

- [x] packages/shared/package.json setup
- [x] Workspace import working from apps/web and apps/api
- [x] Auth schemas
- [~] Training schemas — deferred to Stage 4 (built with training tables)
- [~] Nutrition schemas — deferred to Stage 8 (built with nutrition tables)
- [~] Body measurements schema — deferred to Stage 10 (built with the table)
- [x] Constants exports (auth: SEX_OPTIONS; domain constants ship with
      their stages alongside the schemas above)
- [x] Inferred type exports for all schemas (auth)
- [x] Refactor existing auth code to use shared schemas (apps/api + apps/web)

---

### Stage 4 — Training backend ✅ COMPLETE

Full CRUD for the training domain, built as five vertical slices
(repository → service → routes → tests). All endpoints validated with Zod
and scoped per user; one migration applied to Neon. 96 route tests passing.

- [x] training_plans schema + migration
- [x] workout_templates schema + migration
- [x] exercises schema + migration (with category enum)
- [x] workout_template_exercises schema + migration
- [x] workout_tags schema + migration
- [x] Training feature module (routes/service/repository)
- [x] TrainingPlan CRUD endpoints (list with templateCount, detail embeds
      ordered templates)
- [x] WorkoutTemplate CRUD endpoints (nested create in plan, transactional
      reorder, detail embeds ordered exercises)
- [x] Exercise CRUD endpoints (category filter)
- [x] WorkoutTemplateExercise CRUD endpoints (nested create with ownership
      chain, transactional reorder)
- [x] WorkoutTag CRUD endpoints (hex-color validation)
- [x] Soft delete logic (is_active flag) — exercises + tags; plans,
      templates, and template-exercises are hard-deleted by design
- [x] Tests for each service — covered by route tests that drive the real
      service over a mocked repository (per the testing convention; no
      separate service-unit-test layer)
- [~] Integration tests for happy paths — proved via live smoke tests
  against Neon (reorder, ownership chain, soft-delete surfacing);
  committed automated DB-integration tests intentionally skipped

---

### Stage 5 — Training UI ✅ COMPLETE

Mobile-first design. Drag-and-drop with touch support. Optimistic updates.
Built as five vertical slices (data layer → UI), one per resource: exercises,
tags, plans, templates, and the template-exercise builder. Functional scope is
complete; visual polish (skeletons, designed empty/error states, toasts) is
deliberately deferred to Stage 14.

- [x] Training feature module (frontend)
- [x] Training plans list view (mobile-optimized) — /plans
- [x] Create/edit training plan form (bottom-sheet)
- [x] Training plan detail view — /plans/$planId
- [x] Workout templates within plan: list, create, edit (+ dnd reorder)
- [~] Exercise dictionary list view — list shipped at /exercises; search lives
  in the builder's exercise picker, not yet on the library page itself
- [x] Create/edit exercise form (name + category)
- [~] Workout tag CRUD UI with color picker — shipped at a standalone /tags
  route (swatch grid + custom hex); folds into Settings when that page lands
- [x] Template builder: add exercises with target sets/reps —
      /templates/$templateId
- [x] Drag-and-drop reordering with touch support (dnd-kit) — templates and
      template-exercises, drag-handle, optimistic cache updates
- [x] React Query hooks with optimistic updates (reorder)
- [~] Empty states with clear CTAs — plain-text empty states present; designed
  treatment deferred to Stage 14
- [ ] Loading skeletons — deferred to Stage 14 (plain-text loaders for now)
- [~] Error states with retry — inline error messages present; retry UI in
  Stage 14
- [ ] Tests for key custom hooks — none written; the slice is mostly CRUD wiring
      with little pure logic. Revisit per the selective-testing convention when
      there's behavior worth locking down

Pages are not yet linked from navigation (no bottom-nav chrome until a later
stage).

---

### Stage 6 — Calendar + workout sessions ✅ COMPLETE

The heart of the app. Mobile-optimized active workout view
(must work one-handed).

- [ ] planned_sessions schema + migration
- [ ] workout_sessions schema + migration
      (with session_type, rating, duration_minutes)
- [ ] exercise_performances schema + migration
- [ ] sets schema + migration (with rir field)
- [ ] workout_session_tags junction schema + migration
- [ ] Backend endpoints for sessions
- [ ] Calendar view (week + month modes), mobile-optimized
- [ ] Display workout tags as colored markers on calendar
- [ ] Assign template to date (grouped by plan)
- [ ] Drag-and-drop to reschedule planned sessions (touch support)
- [ ] "Start workout" flow from PlannedSession
- [ ] Ad-hoc strength workout flow (start from template)
- [ ] Quick log flow (ad-hoc cardio/other, no template, no exercises)
- [ ] Active session UI: mobile-first, one-handed usable
- [ ] Set logging: large +/- controls, weight/reps/RIR input
- [ ] Exercise swap modal (filters to same category)
- [ ] Track original_exercise_id vs actual_exercise_id
- [ ] Session and per-exercise notes
- [ ] Finish workout flow: star rating, tag picker, final notes
- [ ] Workout history list and detail view
- [ ] Zustand store for in-progress session draft

---

### Stage 7 — Training stats ✅ COMPLETE

Per-exercise progress and the workout rating trend over the Stage 6 data — no new
tables. Aggregation runs server-side in SQL (not pure JS functions): three
read-only endpoints under `/api/stats` (logged-exercise picker, per-exercise
progress, rating trend), each scoped by user and covered by route tests. The web
`/stats` page stacks an exercise progress chart — one chart with a max-weight /
volume metric toggle rather than a separate weekly-bars chart — and the
rating-trend chart, built with Recharts and reached from primary nav.

- [ ] Pure aggregation functions (max weight, total volume, etc.)
- [ ] Backend endpoints for aggregated data
- [ ] Progress chart per exercise (Recharts)
- [ ] Volume chart (weekly bars)
- [ ] Workout rating trend chart
- [ ] Exercise selector for charts
- [ ] Memoization where measured to help (with comments)
- [ ] Vitest tests for all aggregation functions

---

### Stage 8 — Nutrition backend ✅ COMPLETE

Foods, recipes (+ recipe_ingredients), food_log, and historical nutrition_targets
tables (migration 0004 applied to Neon). The nutrition feature module ships full
CRUD across repository/service/routes: food and recipe dictionaries (soft-deleted,
case-insensitive unique names), recipes with macros computed on read from
ingredients (server-side, no cached columns) and a servings count; the food-log
diary snapshots macros at log time (a food by grams, a recipe by per-serving ×
servings) so editing/deleting a source never rewrites history, with day-totals and
a linear quantity-rescale on edit; and historical nutrition targets via a
single-row-per-date upsert ("current" = most recent). Pure macro math
(scale/sum/divide/multiply) lives in nutrition.utils with unit tests; 43 nutrition
tests in all.

- [ ] foods schema + migration
- [ ] recipes schema + migration
- [ ] recipe_ingredients schema + migration
- [ ] food_log schema + migration
- [ ] nutrition_targets schema + migration
      (historical, UNIQUE per date)
- [ ] Nutrition feature module (routes/service/repository)
- [ ] Food CRUD endpoints
- [ ] Recipe CRUD endpoints (with auto-macro calculation)
- [ ] FoodLog CRUD endpoints (per-day queries)
- [ ] NutritionTarget endpoints (current, history, create)
- [ ] Pure functions for macro calculation (testable)
- [ ] Tests for macro calculation and "current target" logic

---

### Stage 9 — Nutrition UI ✅ COMPLETE

Mobile-first. Most complex UI module. The apps/web nutrition feature ships four
vertical slices over the Stage 8 endpoints: the food dictionary (list + search +
create/edit Sheet form, soft-delete); recipes (list + a full-page builder at
/recipes/new and /recipes/$recipeId with a per-ingredient food picker and a live
whole-recipe + per-serving macro preview); the daily diary (/diary, today by
default with day navigation, add a food by grams or a recipe by servings via a
sheet, remove entries, and a day summary with per-macro progress bars vs the
current target); and targets (edit current + history). Macro math was lifted into
@gym-bro/shared so the builder's live preview and the backend snapshots share one
source of truth. Diary is in primary nav; Foods/Recipes/Targets under Library.
(Inline quantity-edit of a diary entry was deferred — delete + re-add covers it;
the PATCH endpoint exists for later.) Post-completion enhancement (migration 0005):
the diary is split into 5 Fitatu-style meals (food_log.meal + meal_type enum), each
section with its own add; and a recipe can be logged by grams or by servings
(food_log.unit + food_log_unit enum).

- [ ] Nutrition feature module (frontend)
- [ ] Food dictionary list view with search
- [ ] Create/edit food form
- [ ] Recipe list view
- [ ] Recipe builder with live macro preview
- [ ] Daily diary view (today by default)
- [ ] Add food/recipe to diary
- [ ] Remove food from diary
- [ ] Daily summary (kcal/B/F/C vs current target)
- [ ] Targets settings page (edit creates new historical entry)
- [ ] Targets history view
- [ ] Progress bars per macro
- [ ] Empty states
- [ ] Tests for key hooks and pure functions

---

### Stage 10 — Body measurements

- [ ] body_measurements schema + migration (weight + body_fat +
      optional biceps/chest/waist/hip/thigh; UNIQUE per date)
- [ ] Body feature module (backend)
- [ ] Body feature module (frontend)
- [ ] Quick-add weight form (primary, prominent on mobile)
- [ ] Expandable "Show more measurements" section
- [ ] Body measurements list (paginated or virtualized)
- [ ] Edit/delete entries
- [ ] Trend chart per measurement
- [ ] 7-day and 30-day moving averages overlay
- [ ] Stats panel (current, last 7d change, last 30d change, total)
- [ ] Date range selector
- [ ] Pure functions for moving averages (tested)
- [ ] Bonus: overlay nutrition target changes on weight chart

---

## MVP Complete

After Stage 10, the app has all three modules functional.

---

## Post-MVP (Stages 11-16)

### Stage 11 — Unified dashboard

- [ ] Today's workout card (if planned)
- [ ] Daily calories vs current target
- [ ] Latest weight + weekly trend
- [ ] Streak counter
- [ ] Parallel data fetching (useQueries)
- [ ] Skeleton states per section

### Stage 12 — Performance pass

- [ ] React DevTools Profiler audit
- [ ] Virtualization for long lists
- [ ] Memoization where measured to help
- [ ] Code splitting per route
- [ ] Lighthouse audit — 95+ desktop, 90+ mobile
- [ ] Bundle analysis
- [ ] Before/after metrics in README

### Stage 13 — Accessibility pass

- [ ] Keyboard navigation everywhere
- [ ] Focus management for modals
- [ ] ARIA labels and aria-live
- [ ] Contrast check WCAG AA
- [ ] Screen reader test
- [ ] Skip links
- [ ] Reduced motion support
- [ ] Verify touch targets ≥44px

### Stage 14 — Polish + animations + responsive

- [ ] Comprehensive empty states
- [ ] Consistent error states
- [ ] Loading skeletons everywhere
- [ ] Smooth transitions (transform/opacity)
- [ ] Mobile responsive polish
- [ ] Toast notification system
- [ ] Confirm dialogs for destructive actions
- [ ] Dark mode polish

### Stage 15 — Production deployment

- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Fly.io
- [ ] Production env vars
- [ ] GitHub Actions auto-deploy
- [ ] Verify cross-origin cookies
- [ ] Demo account with test data
- [ ] Smoke test

### Stage 16 — Full documentation

- [ ] README rewrite with screenshots, demo link
- [ ] ARCHITECTURE.md with diagrams
- [ ] DECISIONS.md finalized
- [ ] Demo account credentials in README
- [ ] GIFs of key flows (mobile)
- [ ] Performance metrics screenshots

---

## Future considerations (not in scope)

- OAuth (Google, GitHub)
- Open Food Facts API integration
- Multi-language UI (i18n)
- Mobile app (React Native or PWA)
- Workout sharing / social features
- Exercise atlas with images/videos
- AI-generated suggestions
- Wearables integration (Apple Health, Google Fit)
- Barcode scanner
- Product images upload
- Meal planning with shopping list
- Macro cycling / refeed days
- Periodization tracking
- Predefined exercise autocomplete suggestions
