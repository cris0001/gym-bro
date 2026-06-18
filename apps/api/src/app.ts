import { Hono } from 'hono';

// The Hono app is created and exported here without binding a port, so tests
// can exercise routes via `app.request()` without opening a socket. The
// server bootstrap (port binding) lives in index.ts.
export const app = new Hono();

// Liveness probe. Uses the project-wide success envelope `{ data: ... }`.
app.get('/health', (c) => c.json({ data: { status: 'ok' } }));
