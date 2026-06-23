import { Hono, type Context } from 'hono';
import { z } from 'zod';
import {
  EXERCISE_CATEGORIES,
  createExerciseSchema,
  createPlanSchema,
  createTagSchema,
  createTemplateSchema,
  reorderSchema,
  updateExerciseSchema,
  updatePlanSchema,
  updateTagSchema,
  updateTemplateSchema,
} from '@gym-bro/shared';

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

// --- Tags ---

trainingRoutes.get('/tags', requireAuth, async (c) => {
  const tags = await trainingService.listTags(c.get('userId'));
  return c.json({ data: tags });
});

trainingRoutes.post('/tags', requireAuth, async (c) => {
  const input = await parseJson(c, createTagSchema);
  const tag = await trainingService.createTag(c.get('userId'), input);
  return c.json({ data: tag }, 201);
});

trainingRoutes.patch('/tags/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const input = await parseJson(c, updateTagSchema);
  const tag = await trainingService.updateTag(c.get('userId'), id, input);
  return c.json({ data: tag });
});

trainingRoutes.delete('/tags/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  await trainingService.deleteTag(c.get('userId'), id);
  return c.json({ data: { success: true } });
});

// --- Plans ---

trainingRoutes.get('/plans', requireAuth, async (c) => {
  const plans = await trainingService.listPlans(c.get('userId'));
  return c.json({ data: plans });
});

trainingRoutes.get('/plans/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const plan = await trainingService.getPlan(c.get('userId'), id);
  return c.json({ data: plan });
});

trainingRoutes.post('/plans', requireAuth, async (c) => {
  const input = await parseJson(c, createPlanSchema);
  const plan = await trainingService.createPlan(c.get('userId'), input);
  return c.json({ data: plan }, 201);
});

trainingRoutes.patch('/plans/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const input = await parseJson(c, updatePlanSchema);
  const plan = await trainingService.updatePlan(c.get('userId'), id, input);
  return c.json({ data: plan });
});

trainingRoutes.delete('/plans/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  await trainingService.deletePlan(c.get('userId'), id);
  return c.json({ data: { success: true } });
});

// --- Templates ---

// Nested under the plan for create/list/reorder; mutated by their own id.
trainingRoutes.post('/plans/:planId/templates', requireAuth, async (c) => {
  const planId = parseUuidParam(c, 'planId');
  const input = await parseJson(c, createTemplateSchema);
  const template = await trainingService.createTemplate(c.get('userId'), planId, input);
  return c.json({ data: template }, 201);
});

trainingRoutes.patch('/plans/:planId/templates/order', requireAuth, async (c) => {
  const planId = parseUuidParam(c, 'planId');
  const input = await parseJson(c, reorderSchema);
  const templates = await trainingService.reorderTemplates(c.get('userId'), planId, input);
  return c.json({ data: templates });
});

trainingRoutes.patch('/templates/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const input = await parseJson(c, updateTemplateSchema);
  const template = await trainingService.updateTemplate(c.get('userId'), id, input);
  return c.json({ data: template });
});

trainingRoutes.delete('/templates/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  await trainingService.deleteTemplate(c.get('userId'), id);
  return c.json({ data: { success: true } });
});
