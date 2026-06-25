import type { Context } from '@netlify/functions';

import { app } from '../../src/app';

// Netlify Functions v2 handler. The Hono app is a standard Web fetch handler, so
// the request goes straight to app.fetch — no adapter needed. The explicit
// Context type + default-exported async handler are the signals Netlify uses to
// classify this as a v2 function. Netlify bundles this file and its imports
// (app, shared) with esbuild at deploy time.
// eslint-disable-next-line no-restricted-syntax -- Netlify Functions v2 requires a default-exported handler
export default async (request: Request, _context: Context): Promise<Response> => {
  return app.fetch(request);
};

// Inline routing: every /api/* request is served by this function with its
// ORIGINAL path preserved, so Hono's /api/* routes match directly — no toml
// rewrite and no prefix-stripping. (The /health probe isn't exposed here; it's a
// local-dev liveness check.)
export const config = {
  path: '/api/*',
};
