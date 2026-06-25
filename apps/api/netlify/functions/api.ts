import type { Handler } from '@netlify/functions';

import { app } from '../../src/app';

// Netlify Functions v1 classic handler. Converts the v1 event into a standard Web
// Request, runs it through the Hono app, and converts the Response back to the v1
// shape. We use event.rawUrl — the ORIGINAL request URL, preserved across the
// netlify.toml /api/* -> function rewrite (status 200) — so Hono's /api/* routes
// match the real path (e.g. /api/auth/login). The app only ever sets the single
// auth_token cookie, so collapsing response headers is safe here.
export const handler: Handler = async (event) => {
  const url = new URL(event.rawUrl);
  // GET/HEAD must not carry a body — passing one (even an empty string, which is
  // what Netlify can send) makes the Request constructor throw.
  const hasBody = !['GET', 'HEAD'].includes(event.httpMethod.toUpperCase());
  const request = new Request(url, {
    method: event.httpMethod,
    headers: event.headers as Record<string, string>,
    body: hasBody ? event.body : null,
  });

  const response = await app.fetch(request);
  const body = await response.text();

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body,
  };
};
