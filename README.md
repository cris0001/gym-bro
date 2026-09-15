# gym-bro

> **Status: Alpha** — core features usable, actively developed.
> Live demo: <https://gym-bro.fly.dev>

A self-hostable, privacy-friendly fitness tracker combining strength
training, nutrition (macros, barcode scanning via Open Food Facts),
weight tracking and Strava sync in one PWA — an open alternative to
closed fitness apps.

## Features

- Training sessions and exercise history
- Nutrition log with macros and EAN barcode lookup (Open Food Facts)
- Body weight and composition tracking
- Strava activity import
- Stats dashboard
- Installable PWA (works in a regular mobile browser too)

## Tech stack

- **Monorepo:** pnpm workspaces (`apps/web`, `apps/api`, `packages/shared`)
- **Frontend:** React 19, Vite, TypeScript (strict), TanStack Query/Router,
  Zustand, Tailwind v4, shadcn/ui, vite-plugin-pwa
- **Backend:** Hono, Drizzle ORM, PostgreSQL (Neon)
- **Shared:** Zod schemas as the single source of truth
- **Tooling:** ESLint, Prettier, Husky, Vitest, GitHub Actions
- **Deploy:** single Hono server serving the SPA and `/api`, hosted on Fly.io

## Getting started

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # set DATABASE_URL etc.
pnpm --filter api db:migrate
pnpm dev
```

Web: <http://localhost:5173> · API: <http://localhost:3000>

## Contributing

Issues and PRs are welcome. Follow the conventions in `CLAUDE.md`,
keep PRs small, and add Vitest coverage for new logic.

## License

MIT — see [`LICENSE`](./LICENSE).
