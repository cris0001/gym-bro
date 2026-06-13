# Architecture Decision Records

This file documents significant architectural decisions made during
the project, in ADR (Architecture Decision Record) format. New
decisions are appended at the bottom.

---

## ADR-001: Use Vite (SPA) instead of Next.js

**Status:** Accepted  
**Date:** 2026-06-13

### Context

This is a portfolio frontend project. The default modern choice
would be Next.js with App Router, but the app has no SEO needs
and no public marketing pages. It's a behind-auth single-page app.

### Decision

Use Vite + React 19 as a pure SPA.

### Consequences

- Smaller scope to learn (no SSR, no RSC complexity)
- Demonstrates that I know when NOT to reach for Next.js
- Backend is separate (Hono) — clear frontend/backend separation
- Trade-off: no server components, no streaming SSR — acceptable
  given this is an authenticated app, not public marketing

---

## ADR-002: Hono instead of Express

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Need a backend framework for the API. Express is the safe,
familiar choice but signals "stack from 2018" in 2026.

### Decision

Use Hono.

### Consequences

- Modern TypeScript-first DX
- Smaller bundle, faster cold starts
- Multi-runtime ready (currently Node, could move to Bun/edge later)
- Express-like API so easy to read for anyone who knows Express
- Signals modern stack awareness for portfolio reviewers
- Trade-off: smaller ecosystem than Express, but enough for this scope

---

## ADR-003: Drizzle ORM instead of Prisma

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Need an ORM for PostgreSQL. Prisma is more popular but has
its own DSL and generates code from schema.prisma.

### Decision

Use Drizzle ORM.

### Consequences

- TypeScript-first, no separate DSL
- SQL-like syntax — easier to reason about queries
- Lightweight, no code generation step
- Modern choice signaling 2026 stack awareness
- Trade-off: smaller ecosystem than Prisma (acceptable for portfolio)

---

## ADR-004: pnpm workspaces monorepo

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Three logical packages: web frontend, api backend, shared Zod
schemas. Could be separate repos or monorepo.

### Decision

Monorepo with pnpm workspaces.

### Consequences

- Shared Zod schemas are local imports — type safety end-to-end
  without publishing packages
- Atomic changes across frontend and backend in one PR
- Single git history, single CI/CD config
- Demonstrates monorepo skills for portfolio
- Trade-off: slightly more complex initial setup

---

## ADR-005: shadcn/ui for component library

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Need a UI component library. Options: build from scratch,
use Material UI / Chakra, use Catalyst (paid Tailwind Labs kit),
or shadcn/ui (OSS copy-paste model).

### Decision

Use shadcn/ui.

### Consequences

- MIT licensed, no licensing risk for public repo
- Industry standard in 2026 React ecosystem
- Copy-paste model means full control over components
- Built on Radix UI primitives (accessible by default)
- Tailwind-based, matches our styling approach
- Components live in source — can be customized as needed

---

## ADR-006: TanStack Router instead of React Router

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Need a routing library for the SPA. React Router v7 is the
mainstream choice but its type safety is opt-in and less complete.

### Decision

Use TanStack Router v1.

### Consequences

- Fully type-safe routes — params and search params inferred
- Better DX with route definitions in code, not file system
- Same team as TanStack Query (already in stack) — consistent API
- Trade-off: smaller community than React Router

---

## ADR-007: Zustand for local UI state, NOT for server state

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Need a state management solution. Options: Context API, Redux,
Zustand, Jotai. Also need to decide what kind of state goes where.

### Decision

Use Zustand v5, but STRICTLY for local UI state only.
ALL server state lives in TanStack Query.

### Consequences

- Clear separation: server state vs local UI state
- No duplication of server data in Zustand
- Smaller bundle than Redux, simpler than Context for global state
- Common use cases: open modals, draft workout in progress,
  theme preference, filters in lists
- Demonstrates understanding that "global state" is not
  one-size-fits-all in modern React

---

## ADR-008: JWT in HttpOnly cookie via jose

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Need authentication. Options for token storage: localStorage
(XSS-vulnerable), HttpOnly cookie (XSS-safe but needs CSRF protection),
session cookies. Token library: jsonwebtoken (legacy) or jose (modern).

### Decision

JWT in HttpOnly cookie, signed with jose.

### Consequences

- HttpOnly cookie not accessible from JS — XSS can't steal token
- SameSite=Lax provides reasonable CSRF protection
- jose is actively maintained, ESM-native, web crypto based
- Trade-off: cookie-based auth slightly more complex than
  Authorization headers, but more secure
- Note: requires CORS configuration with credentials: 'include'

---

## ADR-009: No production deploy in MVP phase

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Best practice would be to deploy from Stage 1 onwards (continuous
deployment from day one). Trade-off: 1-2 days of upfront work vs
risk of deploy storm at the end.

### Decision

Defer production deploy to Stage 15. Provide minimal README in
Stage 2.5 to give context to anyone who finds the repo mid-build.

### Consequences

- Faster path to MVP completion
- Risk: deploy storm at the end may take 3-5 days
- Mitigation: use .env.example from Stage 0, design API with
  CORS in mind from start, use Drizzle migrations from first table
- Mitigation: README clearly marks status as work-in-progress

---

## ADR-010: No seeded data for regular users

**Status:** Accepted  
**Date:** 2026-06-13

### Context

Options for new users: start with empty app, or pre-seed foods
and exercises. Pre-seeding helps day-1 UX but couples the app
to assumed data choices (language, regional foods).

### Decision

New users start with completely empty app. They build their own
exercise dictionary, food list, and recipes from scratch.

### Consequences

- App is agnostic to user's language (food/exercise names are user input)
- No maintenance of seed data sets
- Demo account will be populated manually at the end of the project
- Trade-off: empty-state UX must be excellent (clear CTAs,
  onboarding hints) since users see nothing initially
