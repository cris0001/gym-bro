import { Hono, type Context } from 'hono';
import { z } from 'zod';
import {
  createFoodLogSchema,
  createFoodSchema,
  createRecipeSchema,
  foodLogDateQuerySchema,
  recentFoodLogQuerySchema,
  setNutritionTargetSchema,
  updateFoodLogSchema,
  updateFoodSchema,
  updateRecipeSchema,
} from '@gym-bro/shared';

import { NotFoundError, ValidationError } from '../../lib/errors';
import { parseJson } from '../../lib/validate';
import { requireAuth, type AppEnv } from '../../middleware/auth';
import * as nutritionService from './nutrition.service';

// Thin handlers: authenticate, validate, delegate, format. requireAuth per route
// (same as the other feature modules). Every handler scopes to c.get('userId').
// Grown per resource, foods first.
export const nutritionRoutes = new Hono<AppEnv>();

// A non-uuid path param can't reference a real row — treat it as not found
// rather than letting Postgres raise an invalid-uuid error (500).
function parseUuidParam(c: Context<AppEnv>, name: string): string {
  const result = z.uuid().safeParse(c.req.param(name));
  if (!result.success) {
    throw new NotFoundError();
  }
  return result.data;
}

// --- Foods ---

nutritionRoutes.get('/foods', requireAuth, async (c) => {
  const searchParam = c.req.query('search')?.trim();
  const search = searchParam && searchParam.length > 0 ? searchParam : undefined;
  const foods = await nutritionService.listFoods(c.get('userId'), search);
  return c.json({ data: foods });
});

nutritionRoutes.post('/foods', requireAuth, async (c) => {
  const input = await parseJson(c, createFoodSchema);
  const food = await nutritionService.createFood(c.get('userId'), input);
  return c.json({ data: food }, 201);
});

nutritionRoutes.put('/foods/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const input = await parseJson(c, updateFoodSchema);
  const food = await nutritionService.updateFood(c.get('userId'), id, input);
  return c.json({ data: food });
});

nutritionRoutes.delete('/foods/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  await nutritionService.deleteFood(c.get('userId'), id);
  return c.json({ data: { success: true } });
});

// --- Recipes ---

nutritionRoutes.get('/recipes', requireAuth, async (c) => {
  const recipes = await nutritionService.listRecipes(c.get('userId'));
  return c.json({ data: recipes });
});

nutritionRoutes.get('/recipes/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const recipe = await nutritionService.getRecipe(c.get('userId'), id);
  return c.json({ data: recipe });
});

nutritionRoutes.post('/recipes', requireAuth, async (c) => {
  const input = await parseJson(c, createRecipeSchema);
  const recipe = await nutritionService.createRecipe(c.get('userId'), input);
  return c.json({ data: recipe }, 201);
});

nutritionRoutes.put('/recipes/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const input = await parseJson(c, updateRecipeSchema);
  const recipe = await nutritionService.updateRecipe(c.get('userId'), id, input);
  return c.json({ data: recipe });
});

nutritionRoutes.delete('/recipes/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  await nutritionService.deleteRecipe(c.get('userId'), id);
  return c.json({ data: { success: true } });
});

// --- Food log ---

nutritionRoutes.get('/food-log', requireAuth, async (c) => {
  const parsed = foodLogDateQuerySchema.safeParse({ date: c.req.query('date') });
  if (!parsed.success) {
    throw new ValidationError('date must be a valid date (YYYY-MM-DD)');
  }
  const day = await nutritionService.getDailyFoodLog(c.get('userId'), parsed.data.date);
  return c.json({ data: day });
});

// Static segment before the /:id routes so "recent" isn't read as an id.
nutritionRoutes.get('/food-log/recent', requireAuth, async (c) => {
  const parsed = recentFoodLogQuerySchema.safeParse({ meal: c.req.query('meal') });
  if (!parsed.success) {
    throw new ValidationError('meal is required and must be a valid meal');
  }
  const items = await nutritionService.getRecentDiaryItems(c.get('userId'), parsed.data.meal);
  return c.json({ data: items });
});

nutritionRoutes.post('/food-log', requireAuth, async (c) => {
  const input = await parseJson(c, createFoodLogSchema);
  const entry = await nutritionService.createFoodLogEntry(c.get('userId'), input);
  return c.json({ data: entry }, 201);
});

nutritionRoutes.patch('/food-log/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  const input = await parseJson(c, updateFoodLogSchema);
  const entry = await nutritionService.updateFoodLogEntry(c.get('userId'), id, input);
  return c.json({ data: entry });
});

nutritionRoutes.delete('/food-log/:id', requireAuth, async (c) => {
  const id = parseUuidParam(c, 'id');
  await nutritionService.deleteFoodLogEntry(c.get('userId'), id);
  return c.json({ data: { success: true } });
});

// --- Nutrition targets ---

nutritionRoutes.get('/nutrition-targets/current', requireAuth, async (c) => {
  const target = await nutritionService.getCurrentTarget(c.get('userId'));
  return c.json({ data: target });
});

nutritionRoutes.get('/nutrition-targets', requireAuth, async (c) => {
  const targets = await nutritionService.listNutritionTargets(c.get('userId'));
  return c.json({ data: targets });
});

nutritionRoutes.put('/nutrition-targets', requireAuth, async (c) => {
  const input = await parseJson(c, setNutritionTargetSchema);
  const target = await nutritionService.setNutritionTarget(c.get('userId'), input);
  return c.json({ data: target });
});
