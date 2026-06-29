import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { statsRangeQuerySchema } from '@gym-bro/shared';

import { NotFoundError, ValidationError } from '../../lib/errors';
import { requireAuth, type AppEnv } from '../../middleware/auth';
import * as statsService from './stats.service';

// Thin handlers: authenticate, validate, delegate, format. requireAuth per route
// (same as sessions.routes). Every handler scopes to c.get('userId'). Read-only.
export const statsRoutes = new Hono<AppEnv>();

// A non-uuid path param can't reference a real row — treat it as not found
// rather than letting Postgres raise an invalid-uuid error (500).
function parseUuidParam(c: Context<AppEnv>, name: string): string {
  const result = z.uuid().safeParse(c.req.param(name));
  if (!result.success) {
    throw new NotFoundError();
  }
  return result.data;
}

// The optional from/to window shared by the progress and rating-trend routes.
function parseRange(c: Context<AppEnv>) {
  const parsed = statsRangeQuerySchema.safeParse({
    from: c.req.query('from'),
    to: c.req.query('to'),
  });
  if (!parsed.success) {
    throw new ValidationError(
      'from and to must be valid dates (YYYY-MM-DD), with from on or before to',
    );
  }
  return parsed.data;
}

// Exercises the user has logged at least once — drives the progress-chart picker.
statsRoutes.get('/stats/exercises', requireAuth, async (c) => {
  const exercises = await statsService.listExercisesWithHistory(c.get('userId'));
  return c.json({ data: exercises });
});

// Per-session max-weight + total-volume progress for one exercise.
statsRoutes.get('/stats/exercises/:exerciseId/progress', requireAuth, async (c) => {
  const exerciseId = parseUuidParam(c, 'exerciseId');
  const range = parseRange(c);
  const points = await statsService.getExerciseProgress(c.get('userId'), exerciseId, range);
  return c.json({ data: points });
});

// Rating over time across all rated sessions.
statsRoutes.get('/stats/rating-trend', requireAuth, async (c) => {
  const range = parseRange(c);
  const points = await statsService.getRatingTrend(c.get('userId'), range);
  return c.json({ data: points });
});
