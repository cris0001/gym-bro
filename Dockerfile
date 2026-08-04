# syntax=docker/dockerfile:1

# One image for the whole app: install the pnpm workspace, build the SPA, and run the
# Hono API via tsx. The API also serves the built SPA (STATIC_DIR) on the same origin,
# so this single Fly service covers both /api and the web app.
FROM node:22-slim

# pnpm via Corepack (version pinned by the repo's package.json "packageManager").
RUN corepack enable
WORKDIR /app

# Install every workspace dep against the committed lockfile, then build the SPA.
# @gym-bro/shared ships its TS source (no build); the API runs straight from source.
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @gym-bro/web build

# Runtime config. STATIC_DIR is absolute so SPA serving is independent of the CWD.
# Fly injects the secrets (DATABASE_URL, JWT_SECRET, CORS_ORIGIN, STRAVA_*) at runtime.
ENV NODE_ENV=production
ENV PORT=8080
ENV STATIC_DIR=/app/apps/web/dist

EXPOSE 8080
# Run the API's own tsx binary from the repo root so module + entry resolution match dev.
CMD ["apps/api/node_modules/.bin/tsx", "apps/api/src/index.ts"]
