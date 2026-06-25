# Deployment (Netlify)

The monorepo deploys to Netlify as two parts from a single site:

- **Frontend** (`apps/web`) — a static SPA, built with Vite to `apps/web/dist`.
- **Backend** (`apps/api`) — the Hono app running as **one** Netlify Function
  (`apps/api/netlify/functions/api.ts`, a v1 classic `handler`). A `netlify.toml`
  redirect rewrites every `/api/*` request to the function; the handler turns the
  Netlify event into a Web `Request` (using `event.rawUrl` to preserve the original
  `/api/...` path so Hono matches), runs `app.fetch`, and converts the `Response`
  back.
- **Database** — stays on **Neon** (pooled connection). Netlify never touches it;
  migrations are run manually (see below).

Because the API is served from the **same origin** as the SPA (via the `/api/*`
rewrite), the HttpOnly auth cookie works without cross-origin CORS.

All of this is configured in **`netlify.toml`** at the repo root.

## Required environment variables

Set these in the Netlify dashboard (**Site configuration → Environment
variables**). They apply at build and/or function runtime.

| Variable       | Value                                                          | Used by            |
| -------------- | -------------------------------------------------------------- | ------------------ |
| `DATABASE_URL` | Neon **pooled** connection string (host contains `-pooler`)    | Function (runtime) |
| `JWT_SECRET`   | Long random string, e.g. `openssl rand -base64 32` (≥32 chars) | Function (runtime) |
| `NODE_ENV`     | `production` (enables the Secure auth cookie)                  | Function (runtime) |
| `CORS_ORIGIN`  | Your site URL, e.g. `https://your-site.netlify.app`            | Function (runtime) |

Notes:

- **No `VITE_API_URL` needed.** The SPA calls relative `/api/...` URLs, which hit
  the same origin (the Netlify Function in prod, the Vite dev-server proxy in dev),
  so there's nothing to configure. (`VITE_API_URL` exists only as an optional
  override to point the SPA at a remote/absolute API.)
- `PORT` is **not** needed on Netlify (functions don't bind a port).
- pnpm comes from the repo's `packageManager` field (`pnpm@11.6.0`) via Corepack;
  `netlify.toml` only pins `NODE_VERSION = "22"`.

## Getting the Neon pooled URL

1. Neon dashboard → your project → **Connection Details**.
2. Toggle/select **"Pooled connection"** (the host will contain `-pooler`).
3. Copy the `postgres://…?sslmode=require` string into `DATABASE_URL`.

The function uses the Neon **WebSocket Pool** driver (kept deliberately, because
the app uses interactive transactions — finishing a workout, editing, etc. — which
the HTTP driver can't do). The pooled endpoint suits short-lived invocations.

## First deploy (Netlify dashboard)

1. **Connect the repo**: Netlify → **Add new site → Import an existing project**,
   pick the Git provider and this repository.
2. Netlify reads **`netlify.toml`**, so build settings are already filled:
   - Build command: `pnpm --filter @gym-bro/web build`
   - Publish directory: `apps/web/dist`
   - Functions directory: `apps/api/netlify/functions` (esbuild bundler)
     Leave them as detected.
3. **Set the environment variables** from the table above before the first build.
4. **Deploy**. Netlify installs deps with pnpm, builds the SPA, and bundles the
   function (esbuild compiles the function plus its TS imports — the Hono app and
   the `@gym-bro/shared` workspace source).

### Verify after deploy

- `https://your-site.netlify.app/` loads the SPA.
- An API call works, e.g. registering/logging in, or
  `https://your-site.netlify.app/api/health` — wait, `/health` is **not** exposed
  (it's a local-dev probe). Instead confirm via the app's login/register flow, or
  any `/api/...` route returning the JSON `{ data }` / `{ error }` envelope.
- If `/api/*` returns 404s, check the `api` function deployed (Netlify →
  Functions tab) and that the `/api/* → /.netlify/functions/api` redirect in
  `netlify.toml` is listed before the SPA fallback (Deploys → redirects).

## Updating env vars later

Netlify dashboard → **Site configuration → Environment variables** → edit. Then
**trigger a redeploy** (Deploys → Trigger deploy → _Deploy site_) so the change
takes effect (build-time vars only apply after a rebuild).

## Database migrations

Migrations are **not** run by Netlify. Run them yourself from a local checkout
against Neon (use the same `DATABASE_URL`), reviewing the SQL first:

```bash
# from repo root, with apps/api/.env pointing at the Neon database
corepack pnpm --filter @gym-bro/api db:migrate
```

## Caveats / expectations

- **Cold starts** (~0.5–1.5s): the first request after the function goes idle pays
  for bundle init + establishing the Neon WebSocket pool. Warm invocations are
  fast. Fine for a single-user/demo app.
- **bcryptjs is pure JS** (swapped from native `bcrypt` so it runs on the
  function). Hashing/verifying at cost 12 is a few hundred ms — noticeable only on
  a cold-start login; otherwise irrelevant.
- **esbuild bundles the `@gym-bro/shared` workspace TS** through its symlink. This
  works in normal setups; if the first deploy fails to resolve `@gym-bro/shared`,
  that's the place to look (the shared package exports its `./src/index.ts`
  directly, no build step).
- **Same-origin auth**: the cookie is `SameSite=Lax` + `Secure` (prod). It works
  because the function is same-origin with the SPA. If you ever split the API onto
  a different domain, you'd need `SameSite=None`.

## Local development is unaffected

Nothing here changes local dev. Still:

```bash
corepack pnpm install
corepack pnpm dev      # web on :5173, API on :3000 via @hono/node-server
```

The Node server bootstrap (`apps/api/src/index.ts`) is local-only and isn't part
of the Netlify function bundle.
