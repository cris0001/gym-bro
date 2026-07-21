# Frontend Architecture & Patterns

A portable description of the frontend structure and conventions. Hand this to
another project to reproduce the same architecture and patterns.

## Stack

- **React 19** + **Vite** (SPA — intentionally not Next.js)
- **TypeScript strict**, zero `any`
- **TanStack Query v5** — all server state
- **Zustand v5** — local UI state only (never server data)
- **TanStack Router v1** — type-safe, file-based routing
- **Tailwind CSS v4** — CSS variables for theming
- **shadcn/ui** (Radix primitives) — copied into the repo, not a dependency
- **React Hook Form + Zod** — forms
- Zod schemas live in a **shared package** and are the single source of truth for
  types (both frontend and backend `z.infer` from them)

## Top-level layout (`src/`)

```
app/          # router + provider composition (router.tsx, app.tsx)
routes/       # TanStack Router file-based routes (thin — mount feature pages)
features/     # feature modules (the bulk of the app)
components/
  ui/         # shadcn primitives (button, sheet, popover, command, …)
  nav/        # shared domain-agnostic chrome (bottom-nav, sidebar, tabs)
hooks/        # shared hooks used by 2+ features (e.g. use-media-query)
lib/          # infrastructure: api-client, query-client, utils (cn)
stores/       # shared Zustand stores (only if used by 2+ features)
utils/        # shared pure functions
globals.css   # Tailwind + design tokens (CSS vars, light/dark)
```

## Feature module anatomy (`features/<name>/`)

Full **co-location** — everything a feature needs lives in its own folder:

```
features/nutrition/
  api/          # thin fetch functions (foods.ts, recipes.ts, food-log.ts)
  components/   # feature components (pages + sub-components)
  hooks/        # one hook per query/mutation (use-foods.ts, use-create-food.ts)
  stores/       # Zustand UI stores (food-ui.store.ts) — optional
  utils/        # feature-only pure fns — optional
  index.ts      # PUBLIC interface — the ONLY thing other code imports
```

Rules:

- Minimum a feature needs: `api/`, `components/`, `index.ts`. Other subfolders only
  when actually needed.
- **`index.ts` is the sole public surface.** It typically exports only page
  components (mounted by routes) plus the occasional hook another feature composes.
  Everything else (api, stores, sub-components) stays private to the feature.
- **Features never import from each other's internals** — cross-feature sharing goes
  through the shared package or root-level `components/`, `hooks/`, `lib/`, `utils/`.
- Import via the barrel: `import { FoodsPage } from '@/features/nutrition'` — never
  `@/features/nutrition/components/foods-page`.

Example `index.ts`:

```ts
// Public interface of the nutrition feature — only page components are consumed
// elsewhere (mounted by the routes). Internals stay private. Grown per slice.
export { FoodsPage } from './components/foods-page';
export { RecipesPage } from './components/recipes-page';
export { DiaryPage } from './components/diary-page';

// Composed by the dashboard (the cross-module aggregation view).
export { useDailyFoodLog } from './hooks/use-daily-food-log';
export { useCurrentTarget } from './hooks/use-current-target';
```

## Data layer (TanStack Query)

Three layers per resource: **api fn → query/mutation hook → component**.

**API function** — pure fetch, no React. Uses a shared `apiFetch` that unwraps a
`{ data }` / `{ error }` envelope:

```ts
export function listBodyMeasurements(): Promise<BodyMeasurement[]> {
  return apiFetch<BodyMeasurement[]>('/api/body-measurements');
}
```

**Query hook** — `queryOptions` + a **key factory** so keys are centralized and
invalidation is precise:

```ts
export const foodLogKeys = {
  all: ['nutrition', 'food-log'] as const,
  day: (date: string) => [...foodLogKeys.all, date] as const,
};

export function dailyFoodLogQueryOptions(date: string) {
  return queryOptions({
    queryKey: foodLogKeys.day(date),
    queryFn: () => getDailyFoodLog(date),
  });
}

export function useDailyFoodLog(date: string) {
  return useQuery(dailyFoodLogQueryOptions(date));
}
```

Exposing `queryOptions` (not just the hook) lets routes prefetch and other hooks
`fetchQuery` the same key.

**Mutation hook** — mutate, then invalidate the factory's `all` key:

```ts
export function useUpsertBodyMeasurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => upsertBodyMeasurement(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: bodyKeys.all }),
  });
}
```

- **No manual `fetch` in components** — always through a hook.
- Numeric precision, snapshotting, and business logic live on the **backend**; the
  frontend consumes plain typed objects.

## Local UI state (Zustand)

Only ephemeral UI — open sheets, edit targets, drafts, filters. **Never duplicate
server data.**

```ts
export const useBodyUiStore = create<BodyUiState>((set) => ({
  editing: null,
  openEdit: (measurement) => set({ editing: measurement }),
  clearEditing: () => set({ editing: null }),
}));
```

Persisted drafts (e.g. an in-progress workout that must survive a refresh) use the
`persist` middleware with a stable `name`.

## Routing

File-based under `routes/`, mirrored into `routeTree.gen.ts`:

- `__root.tsx` → `_auth.tsx` (public) and `_app.tsx` (protected layout with a
  `beforeLoad` auth guard + nav chrome).
- Route files are **thin** — they mount a feature page: `routes/_app/foods.tsx`
  renders `<FoodsPage />`. No business logic in routes.
- Nested / param routes: `plans/$planId.tsx`, `recipes/$recipeId.tsx`.

## Forms

- **React Hook Form + `zodResolver`**, with a local form schema that mirrors the
  shared schema but uses **string inputs** (so a half-typed value is preserved and
  an empty field reads as "not set", not `0`). Convert to numbers on submit.
- The shared Zod schema validates on the server; the form mirrors it for UX.

## Components

- shadcn primitives in `components/ui/` — edit only when intentionally customizing,
  documented at the top of the file.
- Domain components **compose** primitives, they don't rebuild them.
- One component per file, **named exports only** (no default exports).
- Keep components ≲150 lines; extract sub-components when they grow.
- Discriminated unions for loading / branch states.

## Styling / mobile-first

- Tailwind utility classes only (no CSS modules, no styled-components).
- Theme via CSS variables in `globals.css`; dark mode by toggling `.dark` on `<html>`.
- **Mobile-first**: base styles target the phone, scale up with `sm:` / `lg:`. Bottom
  sheets go full-screen on mobile, tap targets ≥44px, critical actions in reach.
- Global density is tuned via the root font-size (rem-based spacing scales together).

## Naming conventions

- Files: **kebab-case** — `use-current-user.ts`, `login-form.tsx`, `food-ui.store.ts`.
- Exports: Components `PascalCase`, hooks `useX` (camelCase), functions `camelCase`,
  types/interfaces `PascalCase`, constants `SCREAMING_SNAKE_CASE`.

## One-paragraph summary

> Feature-first, fully co-located modules with a single `index.ts` public interface.
> Server state exclusively through TanStack Query using `queryOptions` + centralized
> key factories and thin `apiFetch` functions; mutations invalidate by factory key.
> Zustand only for ephemeral UI. Type-safe file-based routing where route files just
> mount feature pages. Types inferred from shared Zod schemas. shadcn + Tailwind,
> mobile-first, named exports, kebab-case files, strict TypeScript.
