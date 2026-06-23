# Project Roadmap

Estimated total: 9-11 weeks of focused work for MVP (Stages 0-10 + 2.5).

Stages 11-16 are post-MVP — optional polish, performance, a11y,
and full production deployment.

---

## MVP Scope (Stages 0-10 + Stage 2.5)

### Stage 0 — Monorepo setup (3-4 days) ✅ COMPLETE

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

### Stage 1 — Backend foundation + auth (4-5 days) ✅ COMPLETE

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

### Stage 2 — Frontend foundation + auth flow + onboarding (4-5 days) ✅ COMPLETE

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

### Stage 3 — Shared package (2-3 days) ✅ COMPLETE

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

### Stage 4 — Training backend (6-8 days) ✅ COMPLETE

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

### Stage 5 — Training UI (8-12 days)

Mobile-first design. Drag-and-drop with touch support.
Optimistic updates.

- [ ] Training feature module (frontend)
- [ ] Training plans list view (mobile-optimized)
- [ ] Create/edit training plan form
- [ ] Training plan detail view
- [ ] Workout templates within plan: list, create, edit
- [ ] Exercise dictionary list view with search
- [ ] Create/edit exercise form (name + category)
- [ ] Workout tag CRUD UI with color picker (Settings)
- [ ] Template builder: add exercises with target sets/reps
- [ ] Drag-and-drop reordering with touch support (dnd-kit)
- [ ] React Query hooks with optimistic updates
- [ ] Empty states with clear CTAs
- [ ] Loading skeletons
- [ ] Error states with retry
- [ ] Tests for key custom hooks

---

### Stage 6 — Calendar + workout sessions (8-12 days)

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

### Stage 7 — Training stats (3-4 days)

- [ ] Pure aggregation functions (max weight, total volume, etc.)
- [ ] Backend endpoints for aggregated data
- [ ] Progress chart per exercise (Recharts)
- [ ] Volume chart (weekly bars)
- [ ] Workout rating trend chart
- [ ] Exercise selector for charts
- [ ] Memoization where measured to help (with comments)
- [ ] Vitest tests for all aggregation functions

---

### Stage 8 — Nutrition backend (5-7 days)

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

### Stage 9 — Nutrition UI (8-12 days)

Mobile-first. Most complex UI module.

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

### Stage 10 — Body measurements (3-4 days)

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

### Stage 11 — Unified dashboard (2-3 days)

- [ ] Today's workout card (if planned)
- [ ] Daily calories vs current target
- [ ] Latest weight + weekly trend
- [ ] Streak counter
- [ ] Parallel data fetching (useQueries)
- [ ] Skeleton states per section

### Stage 12 — Performance pass (3-4 days)

- [ ] React DevTools Profiler audit
- [ ] Virtualization for long lists
- [ ] Memoization where measured to help
- [ ] Code splitting per route
- [ ] Lighthouse audit — 95+ desktop, 90+ mobile
- [ ] Bundle analysis
- [ ] Before/after metrics in README

### Stage 13 — Accessibility pass (2-3 days)

- [ ] Keyboard navigation everywhere
- [ ] Focus management for modals
- [ ] ARIA labels and aria-live
- [ ] Contrast check WCAG AA
- [ ] Screen reader test
- [ ] Skip links
- [ ] Reduced motion support
- [ ] Verify touch targets ≥44px

### Stage 14 — Polish + animations + responsive (3-4 days)

- [ ] Comprehensive empty states
- [ ] Consistent error states
- [ ] Loading skeletons everywhere
- [ ] Smooth transitions (transform/opacity)
- [ ] Mobile responsive polish
- [ ] Toast notification system
- [ ] Confirm dialogs for destructive actions
- [ ] Dark mode polish

### Stage 15 — Production deployment (1-2 days)

- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Fly.io
- [ ] Production env vars
- [ ] GitHub Actions auto-deploy
- [ ] Verify cross-origin cookies
- [ ] Demo account with test data
- [ ] Smoke test

### Stage 16 — Full documentation (3-4 days)

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
