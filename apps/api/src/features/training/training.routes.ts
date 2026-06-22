import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { EXERCISE_CATEGORIES, createExerciseSchema, updateExerciseSchema } from '@gym-bro/shared';

import { NotFoundError, ValidationError } from '../../lib/errors';
import { parseJson } from '../../lib/validate';
import { requireAuth, type AppEnv } from '../../middleware/auth';
import * as trainingService from './training.service';

// Thin handlers: authenticate, validate, delegate to the service, format the
// response. requireAuth is applied per route (not via a '*' wildcard, which
// would also catch the sibling /api/auth/* public routes once mounted at /api).
// Every handler scopes to c.get('userId').
export const trainingRoutes = new Hono<AppEnv>();

// A non-uuid path param can't reference a real row — treat it as not found
// rather than letting Postgres raise an invalid-uuid error (500).
function parseUuidParam(c: Context<AppEnv>, name: string): string {
  const result = z.uuid().safeParse(c.req.param(name));
  if (!result.success) {
    throw new NotFoundError();
  }
  return result.data;
}

const categoryQuerySchema = z.enum(EXERCISE_CATEGORIES).optional();

// --- Exercises ---

trainingRoutes.get('/exercises', requireAuth, async (c) => {
  // Absent or empty ?category= means "no filter".
  const categoryParam = c.req.query('category');
  const parsed = categoryQuerySchema.safeParse(categoryParam === '' ? undefined : categoryParam);
  if (!parsed.success) {
    throw new ValidationError('Invalid category');
  }
  const exercises = await trainingService.listExercises(c.get('userId'), parsed.data);
  return c.json({ data: exercises });
});

trainingRoutes.post('/exercises', requireAuth, async (c) => {
  const input = await parseJson(c, createExerciseSchema);
  const exercise = await trainingService.createExercise(c.get('userId'), input);
  return c.json({ data: exercise }, 201);
});

trainingRoutes.patch('/exercises/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const input = await parseJson(c, updateExerciseSchema);
  const exercise = await trainingService.updateExercise(c.get('userId'), id, input);
  return c.json({ data: exercise });
});

trainingRoutes.delete('/exercises/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  await trainingService.deleteExercise(c.get('userId'), id);
  return c.json({ data: { success: true } });
});
