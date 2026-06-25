import { app } from '../../src/app';

// Netlify Functions v2 handler. The Hono app is a standard Web fetch handler, so
// the incoming Request goes straight to app.fetch — no adapter needed. Netlify
// bundles this file and its imports (app, shared) with esbuild at deploy time.
// The framework mandates the handler as the default export (overriding the repo's
// named-exports-only rule).
// eslint-disable-next-line no-restricted-syntax -- Netlify Functions v2 requires a default-exported handler
export default (request: Request): Response | Promise<Response> => app.fetch(request);

// Inline routing: every /api/* request is served by this function with its
// ORIGINAL path preserved, so Hono's /api/* routes match directly — no toml
// rewrite and no prefix-stripping. (The /health probe isn't exposed here; it's a
// local-dev liveness check.)
export const config = {
  path: '/api/*',
};
