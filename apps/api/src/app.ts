import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { authRoutes } from './features/auth/auth.routes';
import { nutritionRoutes } from './features/nutrition/nutrition.routes';
import { sessionsRoutes } from './features/sessions/sessions.routes';
import { statsRoutes } from './features/stats/stats.routes';
import { trainingRoutes } from './features/training/training.routes';
import { env } from './lib/env';
import { errorHandler } from './middleware/error';

// The Hono app is created and exported here without binding a port, so tests
// can exercise routes via `app.request()` without opening a socket. The
// server bootstrap (port binding) lives in index.ts.
export const app = new Hono();

// credentials: true lets the browser send/receive the HttpOnly auth cookie
// cross-origin (Vite dev server -> API). Registered before routes.
app.use('*', cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Centralizes every thrown/rejected error into the consistent error envelope.
app.onError(errorHandler);

// Liveness probe. Uses the project-wide success envelope `{ data: ... }`.
app.get('/health', (c) => c.json({ data: { status: 'ok' } }));

// Feature modules.
app.route('/api/auth', authRoutes);
// Training routes self-define their own /exercises, /plans, etc. paths and
// apply requireAuth per route, so they mount at the shared /api prefix.
app.route('/api', trainingRoutes);
// Sessions routes (/planned-sessions, /workout-sessions) likewise self-define
// their paths with per-route auth, mounted at the shared /api prefix.
app.route('/api', sessionsRoutes);
// Stats routes (/stats/*) — read-only training aggregations, per-route auth,
// mounted at the shared /api prefix.
app.route('/api', statsRoutes);
// Nutrition routes (/foods, /recipes, /food-log, /nutrition-targets) — per-route
// auth, mounted at the shared /api prefix.
app.route('/api', nutritionRoutes);
