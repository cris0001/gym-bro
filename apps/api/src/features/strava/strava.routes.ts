import { Hono } from 'hono';
import { z } from 'zod';

import { env } from '../../lib/env';
import { ValidationError } from '../../lib/errors';
import { requireAuth, type AppEnv } from '../../middleware/auth';
import * as stravaService from './strava.service';

// Thin handlers: authenticate (except the callback), validate, delegate, format.
export const stravaRoutes = new Hono<AppEnv>();

// Where the callback sends the browser back to (the SPA), with a status flag the
// Strava page reads. CORS_ORIGIN is the app origin (same site in prod); strip a
// trailing slash so the redirect never doubles up (e.g. "https://x//strava").
const appUrl = env.CORS_ORIGIN.replace(/\/$/, '');
const connectedRedirect = `${appUrl}/strava?connected=1`;
const errorRedirect = `${appUrl}/strava?error=1`;

// Strava sends the granted `scope` + `code` + `state` on success, or `error` (e.g.
// "access_denied") when the user declines. All optional — validated in the handler.
const callbackQuerySchema = z.object({
  code: z.string().optional(),
  scope: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
});

// Start the OAuth flow: redirect the (authenticated) user to Strava's consent page.
stravaRoutes.get('/strava/connect', requireAuth, async (c) => {
  const url = await stravaService.getAuthorizeUrl(c.get('userId'));
  return c.redirect(url);
});

// OAuth callback — hit by the browser via a redirect from Strava, so it is NOT
// behind requireAuth: the signed `state` identifies the user. On any failure (denied,
// bad state/code, Strava error) redirect back to the app with an error flag rather
// than showing a raw error page.
stravaRoutes.get('/strava/callback', async (c) => {
  const parsed = callbackQuerySchema.safeParse(c.req.query());
  if (!parsed.success || parsed.data.error || !parsed.data.code || !parsed.data.state) {
    return c.redirect(errorRedirect);
  }
  try {
    await stravaService.completeConnection({
      code: parsed.data.code,
      state: parsed.data.state,
      scope: parsed.data.scope ?? null,
    });
  } catch {
    return c.redirect(errorRedirect);
  }
  return c.redirect(connectedRedirect);
});

// Connection status for the UI.
stravaRoutes.get('/strava/status', requireAuth, async (c) => {
  const status = await stravaService.getStatus(c.get('userId'));
  return c.json({ data: status });
});

// Imported activities, newest first. Optional from/to (local dates) filter — the
// calendar passes a month window; the Strava page loads all.
const sessionsQuerySchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});
stravaRoutes.get('/strava/sessions', requireAuth, async (c) => {
  const parsed = sessionsQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    throw new ValidationError('Invalid date range');
  }
  const sessions = await stravaService.listSessions(
    c.get('userId'),
    parsed.data.from,
    parsed.data.to,
  );
  return c.json({ data: sessions });
});

// Import recent activities from Strava (idempotent upsert). Returns how many were
// pulled. Fails 400 if not connected (surfaced from the service).
stravaRoutes.post('/strava/import', requireAuth, async (c) => {
  const result = await stravaService.importRecentActivities(c.get('userId'));
  return c.json({ data: result });
});

// Disconnect: forget the stored tokens.
stravaRoutes.delete('/strava/connect', requireAuth, async (c) => {
  await stravaService.disconnect(c.get('userId'));
  return c.json({ data: { success: true } });
});
