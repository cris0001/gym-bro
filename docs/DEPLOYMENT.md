# Deployment (Fly.io)

The whole app deploys as **one Fly.io app** (a single container):

- **Backend** (`apps/api`) — the Hono app runs as a long-lived Node server
  (`apps/api/src/index.ts` via `@hono/node-server`, started with `tsx` — no build
  step; `@gym-bro/shared` ships its TS source directly).
- **Frontend** (`apps/web`) — a static SPA built with Vite to `apps/web/dist`. The
  **same** Hono server serves it: when `STATIC_DIR` is set, static assets are served
  from that directory with an `index.html` fallback for client-side routes. `/api/*`
  and `/health` stay API responses (matched first).
- **Database** — stays on **Neon** (pooled). Fly never provisions a database;
  migrations are run manually (see below).

Because the API and SPA are the **same origin**, the HttpOnly auth cookie works with
no cross-origin CORS.

Config lives in **`Dockerfile`** and **`fly.toml`** at the repo root.

## How the container is built and run

`Dockerfile` (node:22-slim):

1. `pnpm install --frozen-lockfile` for the whole workspace.
2. `pnpm --filter @gym-bro/web build` → `apps/web/dist`.
3. Runs `apps/api/node_modules/.bin/tsx apps/api/src/index.ts` from the repo root.

Baked-in runtime env (not secrets): `NODE_ENV=production`, `PORT=8080`,
`STATIC_DIR=/app/apps/web/dist` (absolute, so serving is CWD-independent). `fly.toml`
maps the public HTTPS service to `internal_port = 8080`.

## Required secrets

Set these with `fly secrets set` (never commit them). Each `set` triggers a rolling
redeploy.

| Secret         | Value                                                          |
| -------------- | -------------------------------------------------------------- |
| `DATABASE_URL` | Neon **pooled** connection string (host contains `-pooler`)    |
| `JWT_SECRET`   | Long random string, e.g. `openssl rand -base64 32` (≥32 chars) |
| `CORS_ORIGIN`  | The app URL, e.g. `https://<app>.fly.dev` (no trailing slash)  |

Optional — Strava integration (all three together or none):

| Secret                 | Value                                       |
| ---------------------- | ------------------------------------------- |
| `STRAVA_CLIENT_ID`     | From your Strava API app                    |
| `STRAVA_CLIENT_SECRET` | From your Strava API app                    |
| `STRAVA_REDIRECT_URI`  | `https://<app>.fly.dev/api/strava/callback` |

Notes:

- `NODE_ENV`, `PORT`, `STATIC_DIR` are set by the image/`fly.toml` — don't set them as
  secrets.
- **No `VITE_API_URL`.** The SPA calls relative `/api/...` URLs on the same origin.
- `CORS_ORIGIN` doubles as the base for the Strava OAuth redirect back to the app, so
  keep it exact and **without** a trailing slash.

## Getting the Neon pooled URL

1. Neon dashboard → your project → **Connection Details**.
2. Select **"Pooled connection"** (the host contains `-pooler`).
3. Copy the `postgres://…?sslmode=require` string into `DATABASE_URL`.

The server uses the Neon **WebSocket Pool** driver (kept deliberately — the app uses
interactive transactions, e.g. finishing a workout, which the HTTP driver can't do).
On a long-lived server the pool stays warm between requests.

## First deploy

Prerequisites: a Fly account and [`flyctl`](https://fly.io/docs/flyctl/install/)
installed.

```bash
flyctl auth login

# Reads the committed fly.toml + Dockerfile. Pick a globally-unique app name and a
# region. Decline any offer to provision a Postgres/Redis — we use Neon.
fly launch --no-deploy

# Secrets (fill in your values). Use the app URL Fly assigned, e.g. gym-bro.fly.dev.
fly secrets set \
  DATABASE_URL="postgres://…-pooler…?sslmode=require" \
  JWT_SECRET="$(openssl rand -base64 32)" \
  CORS_ORIGIN="https://<app>.fly.dev"

# Optional, if using Strava:
fly secrets set \
  STRAVA_CLIENT_ID="…" \
  STRAVA_CLIENT_SECRET="…" \
  STRAVA_REDIRECT_URI="https://<app>.fly.dev/api/strava/callback"

fly deploy
```

If using Strava, also set the **Authorization Callback Domain** in your Strava API
app to `<app>.fly.dev` (domain only, no path).

`fly launch` may rewrite `app` / `primary_region` in `fly.toml` to what you pick —
commit that change.

### Verify after deploy

- `https://<app>.fly.dev/` loads the SPA.
- `https://<app>.fly.dev/health` returns `{"data":{"status":"ok"}}` (the single app
  serves it too).
- Log in / register to confirm an `/api/...` round-trip and the auth cookie.
- `fly logs` to watch the server; `fly status` for machine health.

## Updating secrets / redeploying

- Change a secret: `fly secrets set KEY="…"` (auto-redeploys).
- Ship code: `fly deploy` (or wire CI later). Pushing to Git does **not** deploy by
  itself unless you add a GitHub Action / Fly GitHub integration.

## Database migrations

Migrations are **not** run by Fly. Run them yourself from a local checkout against
Neon (same `DATABASE_URL`), reviewing the SQL first:

```bash
# from repo root, with apps/api/.env pointing at the Neon database
corepack pnpm --filter @gym-bro/api db:migrate
```

## Caveats / expectations

- **Scale to zero**: `fly.toml` stops the machine when idle (`min_machines_running =
0`) and cold-starts it on the next request (a few seconds). Set it to `1` to stay
  always warm at the cost of more machine hours.
- **Image runs TS via `tsx`** (no compile step). Simple and matches dev; the image
  carries the TS source + `tsx`. Swapping to a bundled JS build later would slim it.
- **bcryptjs is pure JS** — no native build in the image.
- **Same-origin auth**: the cookie is `SameSite=Lax` + `Secure` (prod), which works
  because the API and SPA share an origin. Splitting them onto different domains would
  need `SameSite=None`.

## Custom domain (later)

```bash
fly certs add app.example.com     # then add the shown A/AAAA (or CNAME) DNS records
```

Then update `CORS_ORIGIN` (and `STRAVA_REDIRECT_URI` + the Strava callback domain) to
the custom domain.

## Local development is unaffected

`STATIC_DIR` is unset locally, so the API serves only `/api` + `/health` and Vite
serves the SPA:

```bash
corepack pnpm install
corepack pnpm dev      # web on :5173, API on :3000 via @hono/node-server
```

## History

Previously deployed on Netlify (static SPA + one Netlify Function). Migrated to the
single-Fly-app model above; the Netlify config and function were removed. See the Git
history for the migration commits.
