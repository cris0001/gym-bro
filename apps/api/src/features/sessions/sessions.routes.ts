import { Hono, type Context } from 'hono';
import { z } from 'zod';
import {
  calendarRangeSchema,
  createActivitySessionSchema,
  createPlannedSessionSchema,
  createStrengthSessionSchema,
  updatePlannedSessionSchema,
  updateWorkoutSessionSchema,
  workoutHistoryQuerySchema,
} from '@gym-bro/shared';

import { NotFoundError, ValidationError } from '../../lib/errors';
import { parseJson } from '../../lib/validate';
import { requireAuth, type AppEnv } from '../../middleware/auth';
import * as sessionsService from './sessions.service';

// Thin handlers: authenticate, validate, delegate, format. requireAuth per route
// (same reasoning as training.routes). Every handler scopes to c.get('userId').
export const sessionsRoutes = new Hono<AppEnv>();

// A non-uuid path param can't reference a real row — treat it as not found
// rather than letting Postgres raise an invalid-uuid error (500).
function parseUuidParam(c: Context<AppEnv>, name: string): string {
  const result = z.uuid().safeParse(c.req.param(name));
  if (!result.success) {
    throw new NotFoundError();
  }
  return result.data;
}

// --- Planned sessions (calendar) ---

sessionsRoutes.get('/planned-sessions', requireAuth, async (c) => {
  const parsed = calendarRangeSchema.safeParse({
    from: c.req.query('from'),
    to: c.req.query('to'),
  });
  if (!parsed.success) {
    throw new ValidationError('from and to must be valid dates (YYYY-MM-DD)');
  }
  const sessions = await sessionsService.listPlannedSessions(c.get('userId'), parsed.data);
  return c.json({ data: sessions });
});

sessionsRoutes.post('/planned-sessions', requireAuth, async (c) => {
  const input = await parseJson(c, createPlannedSessionSchema);
  const session = await sessionsService.createPlannedSession(c.get('userId'), input);
  return c.json({ data: session }, 201);
});

sessionsRoutes.patch('/planned-sessions/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const input = await parseJson(c, updatePlannedSessionSchema);
  const session = await sessionsService.updatePlannedSession(c.get('userId'), id, input);
  return c.json({ data: session });
});

sessionsRoutes.delete('/planned-sessions/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  await sessionsService.deletePlannedSession(c.get('userId'), id);
  return c.json({ data: { success: true } });
});

// --- Workout sessions ---

// "Finish workout" — the whole graph in one body, written atomically.
sessionsRoutes.post('/workout-sessions/strength', requireAuth, async (c) => {
  const input = await parseJson(c, createStrengthSessionSchema);
  const session = await sessionsService.createStrengthSession(c.get('userId'), input);
  return c.json({ data: session }, 201);
});

sessionsRoutes.post('/workout-sessions/activity', requireAuth, async (c) => {
  const input = await parseJson(c, createActivitySessionSchema);
  const session = await sessionsService.createActivitySession(c.get('userId'), input);
  return c.json({ data: session }, 201);
});

sessionsRoutes.get('/workout-sessions', requireAuth, async (c) => {
  const parsed = workoutHistoryQuerySchema.safeParse({
    limit: c.req.query('limit'),
    offset: c.req.query('offset'),
  });
  if (!parsed.success) {
    throw new ValidationError('limit and offset must be valid numbers');
  }
  const page = await sessionsService.listWorkoutSessions(c.get('userId'), parsed.data);
  return c.json({ data: page });
});

sessionsRoutes.get('/workout-sessions/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const session = await sessionsService.getWorkoutSession(c.get('userId'), id);
  return c.json({ data: session });
});

sessionsRoutes.patch('/workout-sessions/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const input = await parseJson(c, updateWorkoutSessionSchema);
  const session = await sessionsService.updateWorkoutSession(c.get('userId'), id, input);
  return c.json({ data: session });
});

sessionsRoutes.delete('/workout-sessions/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  await sessionsService.deleteWorkoutSession(c.get('userId'), id);
  return c.json({ data: { success: true } });
});
