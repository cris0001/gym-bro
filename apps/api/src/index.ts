import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

import { app } from './app';
import { env } from './lib/env';

// Server bootstrap: the only place that binds a port. Importing `env` here
// validates the environment before we start listening (fail fast on misconfig).

// Single-app deploy (Fly): the same server also serves the built SPA. Static assets
// come from STATIC_DIR; anything else falls back to index.html for client-side
// routing — except /api and /health, which stay API responses. The /api routes are
// registered first (in app.ts), so real endpoints are matched before this fallback.
// STATIC_DIR is unset in local dev, where Vite serves the SPA, so this is skipped.
if (env.STATIC_DIR) {
  const root = env.STATIC_DIR;
  app.use('/*', serveStatic({ root }));
  const indexHtml = serveStatic({ path: `${root}/index.html` });
  app.get('*', (c, next) =>
    c.req.path.startsWith('/api') || c.req.path === '/health' ? next() : indexHtml(c, next),
  );
}

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
});
