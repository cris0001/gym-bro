# gym-bro

> **Status: Work in progress** — early setup. Not yet runnable end-to-end.

A personal fitness tracker combining strength training, nutrition (macros),
and weight tracking in one app. Built as a portfolio project.

## Tech stack

- **Monorepo:** pnpm workspaces (`apps/web`, `apps/api`, `packages/shared`)
- **Frontend:** React 19, Vite, TypeScript (strict), TanStack Query/Router,
  Zustand, Tailwind v4, shadcn/ui
- **Backend:** Hono, Drizzle ORM, PostgreSQL (Neon)
- **Shared:** Zod schemas as the single source of truth
- **Tooling:** ESLint, Prettier, Husky, Vitest, GitHub Actions

## Documentation

- [`CLAUDE.md`](./CLAUDE.md) — project context and conventions
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — staged build plan
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — architecture decision records

A full README (setup instructions, screenshots, demo) lands in Stage 2.5
and is expanded in Stage 16.
