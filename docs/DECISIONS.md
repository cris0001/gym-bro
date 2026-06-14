# Architecture Decision Records

This file documents significant architectural decisions made during
the project, in ADR (Architecture Decision Record) format.

---

## ADR-001: Use Vite (SPA) instead of Next.js

**Status:** Accepted  
**Date:** 2026-06-13

### Context

This is a frontend project with no SEO needs and no public marketing
pages. It's a behind-auth single-page app.

### Decision

Use Vite + React 19 as a pure SPA.

### Consequences

- Smaller scope (no SSR, no RSC complexity)
- Demonstrates knowing when NOT to reach for Next.js
- Backend is separate (Hono) — clear frontend/backend separation
- Trade-off: no server components, no streaming SSR — acceptable for
  authenticated app

---

## ADR-002: Hono instead of Express

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Need a backend framework. Express signals "stack from 2018" in 2026.

### Decision

Use Hono.

### Consequences

- Modern TypeScript-first DX
- Smaller bundle, faster cold starts
- Multi-runtime ready (Node now, could move to Bun/edge later)
- Express-like API — easy to read for anyone who knows Express
- Trade-off: smaller ecosystem than Express, but enough for this scope

---

## ADR-003: Drizzle ORM instead of Prisma

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Need an ORM for PostgreSQL. Prisma has its own DSL.

### Decision

Use Drizzle ORM.

### Consequences

- TypeScript-first, no separate DSL
- SQL-like syntax — easier to reason about queries
- Lightweight, no code generation step
- Trade-off: smaller ecosystem than Prisma

---

## ADR-004: pnpm workspaces monorepo

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Three logical packages: web frontend, api backend, shared Zod schemas.

### Decision

Monorepo with pnpm workspaces.

### Consequences

- Shared Zod schemas as local imports — type safety end-to-end
- Atomic changes across frontend and backend in one PR
- Single git history, single CI/CD config
- Trade-off: slightly more complex initial setup

---

## ADR-005: shadcn/ui for component library

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Need a UI component library. Catalyst (paid) was considered but has
licensing concerns for public repo.

### Decision

Use shadcn/ui (MIT licensed, copy-paste model).

### Consequences

- No licensing risk for public repo
- Industry standard in 2026 React ecosystem
- Copy-paste model means full control
- Built on Radix UI primitives (accessible by default)
- Components live in source — can be customized as needed

---

## ADR-006: TanStack Router instead of React Router

**Status:** Accepted  
**Date:** 2026-06-13

### Decision

Use TanStack Router v1.

### Consequences

- Fully type-safe routes — params and search params inferred
- Same team as TanStack Query — consistent API
- Trade-off: smaller community than React Router

---

## ADR-007: Zustand for local UI state, NOT for server state

**Status:** Accepted  
**Date:** 2026-06-13

### Decision

Use Zustand v5, STRICTLY for local UI state only. ALL server state
lives in TanStack Query.

### Consequences

- Clear separation: server vs local state
- No duplication of server data in Zustand
- Common use cases: open modals, draft workout in progress, theme
- Demonstrates that "global state" is not one-size-fits-all

---

## ADR-008: JWT in HttpOnly cookie via jose

**Status:** Accepted  
**Date:** 2026-06-13

### Decision

JWT in HttpOnly cookie, signed with jose.

### Consequences

- HttpOnly cookie not accessible from JS — XSS can't steal token
- SameSite=Lax provides reasonable CSRF protection
- jose is actively maintained, ESM-native, web crypto based
- Requires CORS configuration with credentials: 'include'

---

## ADR-009: No production deploy in MVP phase

**Status:** Accepted  
**Date:** 2026-06-13

### Decision

Defer production deploy to Stage 15. Minimal README in Stage 2.5.

### Consequences

- Faster path to MVP completion
- Risk: deploy storm at the end may take 3-5 days
- Mitigation: .env.example from Stage 0, CORS-aware API design,
  Drizzle migrations from first table

---

## ADR-010: No seeded data for regular users

**Status:** Accepted  
**Date:** 2026-06-13

### Decision

New users start with completely empty app. Demo account populated
manually at the end.

### Consequences

- App is agnostic to user's language
- No maintenance of seed data sets
- Trade-off: empty-state UX must be excellent

---

## ADR-011: English-only UI in MVP (no i18n)

**Status:** Accepted  
**Date:** 2026-06-13

### Decision

UI is English-only. User-generated content is language-agnostic.

### Consequences

- Saves ~8-12 dev days
- Reduces per-feature overhead
- Polish users can still use the app (write data in Polish)
- Future work: add react-i18next as v2 feature

---

## ADR-012: Nutrition targets as historical data

**Status:** Accepted  
**Date:** 2026-06-13

### Context

User's nutrition targets change over time (bulk, cut, maintenance).

### Decision

Store nutrition targets as historical entries — one row per date
change. "Current target" = most recent entry before/on today.

### Consequences

- Enables charting target history
- Demonstrates senior thinking about temporal data
- Same pattern used for body_measurements — consistent architecture
- Trade-off: more complex query for "current target", acceptable

---

## ADR-013: Body measurements module (not just weight)

**Status:** Accepted  
**Date:** 2026-06-13

### Decision

One body_measurements table with weight as primary field and
others (body_fat, biceps, chest, waist, hip, thigh) optional.

### Consequences

- Single table for all body data — simpler
- All fields optional within an entry
- UI stays clean for users tracking only weight (90% case)
- Advanced users supported without UI clutter

---

## ADR-014: Mobile-first design throughout

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Primary use case is mobile — logging workouts at the gym (often
one-handed), tracking meals on-the-go.

### Decision

Design and build mobile-first from Stage 2 onwards. Base styles
target mobile; scale UP for tablet/desktop.

### Consequences

- Touch targets ≥44px from the start
- Modals use bottom-sheet pattern on mobile
- Active workout view must be usable one-handed
- All features tested on actual phone before "done"

---

## ADR-015: Feature-based co-location for both frontend and backend

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Two organizational patterns considered:

- Type-based (components/, hooks/, services/ at root) — split per file type
- Feature-based co-location (features/auth/ has all auth-related code)

### Decision

Full feature-based co-location. Each feature folder contains
everything specific to it: components, hooks, types, utils, stores,
API calls. Shared code at root level only when used across 2+ features.

### Consequences

- High discoverability — everything for one feature in one place
- Easy to delete a feature — one folder, gone
- Forces clear boundaries between features
- index.ts as public interface enforces encapsulation
- Trade-off: occasional duplication if two features need similar
  utility (acceptable — extract to root only when actual need arises)

---

## ADR-016: One file per step working style

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Claude Code tends to batch many file creations in one go. This makes
review harder and reduces user understanding of generated code.

### Decision

Enforce ONE FILE PER STEP when working with Claude Code. After each
file, Claude stops and waits for user review.

### Consequences

- Slower velocity per session
- Higher comprehension and quality
- Better atomic commit history
- Easier to course-correct mid-feature
- Trade-off: more total session time, but better outcomes

---

## ADR-017: Architectural decisions require user input

**Status:** Accepted  
**Date:** 2026-06-13

### Context

AI tools default to making unilateral architectural decisions. This
can lead to subtle inconsistencies or bad choices that surface later.

### Decision

For ANY non-trivial decision (schema design, API shape, state
management approach, naming conventions), Claude presents 2-3 options
with pros/cons and recommendation, then waits for user choice.

### Consequences

- User builds understanding of architecture
- User can interview-explain every decision
- Catches mistakes early (when fixable)
- Trade-off: more friction in workflow, acceptable for portfolio quality
