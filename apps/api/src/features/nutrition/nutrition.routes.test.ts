import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../app';
import type { Recipe } from '../../db/schema/recipes';
import { AUTH_COOKIE_NAME } from '../../lib/auth-cookie';
import { signToken } from '../../lib/jwt';
import type {
  FoodLogEntryRow,
  FoodRow,
  NutritionTargetRow,
  RecipeIngredientWithFoodRow,
  RecipeWithTotalsRow,
} from './nutrition.repository';
import * as nutritionRepository from './nutrition.repository';

// Mock the Drizzle boundary so tests drive the real Hono app + service over fake
// rows. Grown per resource, foods first.
vi.mock('./nutrition.repository');
const repo = vi.mocked(nutritionRepository);

const FOOD_ID = '11111111-1111-4111-8111-111111111111';

function fakeFood(overrides: Partial<FoodRow> = {}): FoodRow {
  return {
    id: FOOD_ID,
    userId: 'user-1',
    name: 'Chicken breast',
    kcal: 165,
    proteinG: 31,
    carbsG: 0,
    fatG: 3.6,
    servingGrams: null,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

// A Postgres unique_violation as Drizzle surfaces it (code on the cause).
const uniqueViolation = new Error('duplicate key value', { cause: { code: '23505' } });
const JSON_HEADERS = { 'content-type': 'application/json' };
const VALID_FOOD = { name: 'Chicken breast', kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 };

async function authCookie(userId = 'user-1'): Promise<string> {
  return `${AUTH_COOKIE_NAME}=${await signToken(userId)}`;
}

function request(method: string, path: string, opts: { body?: unknown; cookie?: string } = {}) {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) Object.assign(headers, JSON_HEADERS);
  if (opts.cookie) headers.cookie = opts.cookie;
  const init: RequestInit = { method, headers };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  return app.request(path, init);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('food list/create routes', () => {
  it('GET /api/foods returns the active foods, forwarding the search filter', async () => {
    repo.listFoods.mockResolvedValue([fakeFood()]);

    const res = await request('GET', '/api/foods?search=chick', { cookie: await authCookie() });
    const body = (await res.json()) as { data: FoodRow[] };

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(repo.listFoods).toHaveBeenCalledWith('user-1', 'chick');
  });

  it('GET /api/foods without auth returns 401', async () => {
    const res = await request('GET', '/api/foods');

    expect(res.status).toBe(401);
    expect(repo.listFoods).not.toHaveBeenCalled();
  });

  it('POST /api/foods creates a food and returns 201', async () => {
    repo.createFood.mockResolvedValue(fakeFood());

    const res = await request('POST', '/api/foods', {
      cookie: await authCookie(),
      body: VALID_FOOD,
    });
    const body = (await res.json()) as { data: FoodRow };

    expect(res.status).toBe(201);
    expect(body.data.id).toBe(FOOD_ID);
    expect(repo.createFood).toHaveBeenCalledWith('user-1', VALID_FOOD);
  });

  it('POST /api/foods with a duplicate name returns 409', async () => {
    repo.createFood.mockRejectedValue(uniqueViolation);

    const res = await request('POST', '/api/foods', {
      cookie: await authCookie(),
      body: VALID_FOOD,
    });

    expect(res.status).toBe(409);
  });

  it('POST /api/foods with a negative macro returns 400', async () => {
    const res = await request('POST', '/api/foods', {
      cookie: await authCookie(),
      body: { ...VALID_FOOD, proteinG: -1 },
    });

    expect(res.status).toBe(400);
    expect(repo.createFood).not.toHaveBeenCalled();
  });
});

describe('food update/delete routes', () => {
  it('PUT /api/foods/:id updates a food the user owns', async () => {
    repo.updateFood.mockResolvedValue(fakeFood({ name: 'Chicken thigh' }));

    const res = await request('PUT', `/api/foods/${FOOD_ID}`, {
      cookie: await authCookie(),
      body: { ...VALID_FOOD, name: 'Chicken thigh' },
    });
    const body = (await res.json()) as { data: FoodRow };

    expect(res.status).toBe(200);
    expect(body.data.name).toBe('Chicken thigh');
  });

  it("PUT /api/foods/:id returns 404 when the food is not the user's", async () => {
    repo.updateFood.mockResolvedValue(undefined);

    const res = await request('PUT', `/api/foods/${FOOD_ID}`, {
      cookie: await authCookie(),
      body: VALID_FOOD,
    });

    expect(res.status).toBe(404);
  });

  it('PUT /api/foods/:id with a non-uuid id returns 404 without touching the repo', async () => {
    const res = await request('PUT', '/api/foods/not-a-uuid', {
      cookie: await authCookie(),
      body: VALID_FOOD,
    });

    expect(res.status).toBe(404);
    expect(repo.updateFood).not.toHaveBeenCalled();
  });

  it('DELETE /api/foods/:id soft-deletes and returns success', async () => {
    repo.softDeleteFood.mockResolvedValue(fakeFood({ isActive: false }));

    const res = await request('DELETE', `/api/foods/${FOOD_ID}`, { cookie: await authCookie() });
    const body = (await res.json()) as { data: { success: boolean } };

    expect(res.status).toBe(200);
    expect(body.data.success).toBe(true);
  });

  it('DELETE /api/foods/:id returns 404 when the food is not found', async () => {
    repo.softDeleteFood.mockResolvedValue(undefined);

    const res = await request('DELETE', `/api/foods/${FOOD_ID}`, { cookie: await authCookie() });

    expect(res.status).toBe(404);
  });
});

const RECIPE_ID = '33333333-3333-4333-8333-333333333333';
const FOOD_A = '44444444-4444-4444-8444-444444444444';
const FOOD_B = '55555555-5555-4555-8555-555555555555';

function fakeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: RECIPE_ID,
    userId: 'user-1',
    name: 'Chili',
    servings: 4,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

// Beef 500g @ 250/26/0/15 per 100g -> 1250/130/0/75; Beans 400g @ 90/6/15/0.5 ->
// 360/24/60/2. Totals 1610/154/60/77 over 900g; perServing (/4) 402.5/38.5/15/19.25.
const INGREDIENT_LINES: RecipeIngredientWithFoodRow[] = [
  {
    id: 'line-1',
    foodId: FOOD_A,
    foodName: 'Beef',
    amountGrams: 500,
    position: 0,
    per100g: { kcal: 250, proteinG: 26, carbsG: 0, fatG: 15 },
  },
  {
    id: 'line-2',
    foodId: FOOD_B,
    foodName: 'Beans',
    amountGrams: 400,
    position: 1,
    per100g: { kcal: 90, proteinG: 6, carbsG: 15, fatG: 0.5 },
  },
];

const VALID_RECIPE = {
  name: 'Chili',
  servings: 4,
  ingredients: [
    { foodId: FOOD_A, amountGrams: 500 },
    { foodId: FOOD_B, amountGrams: 400 },
  ],
};

describe('recipe create route (macro computation)', () => {
  it('POST /api/recipes validates foods, creates, and returns computed macro totals', async () => {
    repo.findActiveFoodsByIds.mockResolvedValue([
      fakeFood({ id: FOOD_A }),
      fakeFood({ id: FOOD_B }),
    ]);
    repo.createRecipe.mockResolvedValue(fakeRecipe());
    repo.listRecipeIngredientsWithFood.mockResolvedValue(INGREDIENT_LINES);

    const res = await request('POST', '/api/recipes', {
      cookie: await authCookie(),
      body: VALID_RECIPE,
    });
    const body = (await res.json()) as {
      data: {
        totalGrams: number;
        total: Record<string, number>;
        perServing: Record<string, number>;
        ingredients: { macros: Record<string, number> }[];
      };
    };

    expect(res.status).toBe(201);
    expect(body.data.totalGrams).toBe(900);
    expect(body.data.total).toEqual({ kcal: 1610, proteinG: 154, carbsG: 60, fatG: 77 });
    expect(body.data.perServing).toEqual({ kcal: 402.5, proteinG: 38.5, carbsG: 15, fatG: 19.25 });
    expect(body.data.ingredients[0]?.macros).toEqual({
      kcal: 1250,
      proteinG: 130,
      carbsG: 0,
      fatG: 75,
    });
  });

  it('POST /api/recipes with an unknown ingredient food returns 400 without creating', async () => {
    // Only one of the two referenced foods is found.
    repo.findActiveFoodsByIds.mockResolvedValue([fakeFood({ id: FOOD_A })]);

    const res = await request('POST', '/api/recipes', {
      cookie: await authCookie(),
      body: VALID_RECIPE,
    });

    expect(res.status).toBe(400);
    expect(repo.createRecipe).not.toHaveBeenCalled();
  });

  it('POST /api/recipes with a duplicate name returns 409', async () => {
    repo.findActiveFoodsByIds.mockResolvedValue([
      fakeFood({ id: FOOD_A }),
      fakeFood({ id: FOOD_B }),
    ]);
    repo.createRecipe.mockRejectedValue(uniqueViolation);

    const res = await request('POST', '/api/recipes', {
      cookie: await authCookie(),
      body: VALID_RECIPE,
    });

    expect(res.status).toBe(409);
  });

  it('POST /api/recipes with no ingredients returns 400', async () => {
    const res = await request('POST', '/api/recipes', {
      cookie: await authCookie(),
      body: { name: 'Empty', servings: 1, ingredients: [] },
    });

    expect(res.status).toBe(400);
    expect(repo.findActiveFoodsByIds).not.toHaveBeenCalled();
  });
});

describe('recipe read/update/delete routes', () => {
  it('GET /api/recipes/:id returns the computed detail', async () => {
    repo.findRecipeById.mockResolvedValue(fakeRecipe());
    repo.listRecipeIngredientsWithFood.mockResolvedValue(INGREDIENT_LINES);

    const res = await request('GET', `/api/recipes/${RECIPE_ID}`, { cookie: await authCookie() });
    const body = (await res.json()) as { data: { perServing: Record<string, number> } };

    expect(res.status).toBe(200);
    expect(body.data.perServing).toEqual({ kcal: 402.5, proteinG: 38.5, carbsG: 15, fatG: 19.25 });
  });

  it("GET /api/recipes/:id returns 404 when not the user's", async () => {
    repo.findRecipeById.mockResolvedValue(undefined);

    const res = await request('GET', `/api/recipes/${RECIPE_ID}`, { cookie: await authCookie() });

    expect(res.status).toBe(404);
  });

  it('GET /api/recipes lists recipes with per-serving macros', async () => {
    const row: RecipeWithTotalsRow = {
      ...fakeRecipe(),
      total: { kcal: 1610, proteinG: 154, carbsG: 60, fatG: 77 },
      totalGrams: 900,
    };
    repo.listRecipesWithTotals.mockResolvedValue([row]);

    const res = await request('GET', '/api/recipes', { cookie: await authCookie() });
    const body = (await res.json()) as { data: { perServing: Record<string, number> }[] };

    expect(res.status).toBe(200);
    expect(body.data[0]?.perServing).toEqual({
      kcal: 402.5,
      proteinG: 38.5,
      carbsG: 15,
      fatG: 19.25,
    });
  });

  it("PUT /api/recipes/:id returns 404 when the recipe is not the user's", async () => {
    repo.findActiveFoodsByIds.mockResolvedValue([
      fakeFood({ id: FOOD_A }),
      fakeFood({ id: FOOD_B }),
    ]);
    repo.replaceRecipe.mockResolvedValue(undefined);

    const res = await request('PUT', `/api/recipes/${RECIPE_ID}`, {
      cookie: await authCookie(),
      body: VALID_RECIPE,
    });

    expect(res.status).toBe(404);
  });

  it('DELETE /api/recipes/:id soft-deletes and returns success', async () => {
    repo.softDeleteRecipe.mockResolvedValue(fakeRecipe({ isActive: false }));

    const res = await request('DELETE', `/api/recipes/${RECIPE_ID}`, {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as { data: { success: boolean } };

    expect(res.status).toBe(200);
    expect(body.data.success).toBe(true);
  });
});

const LOG_ID = '66666666-6666-4666-8666-666666666666';

function fakeLogEntry(overrides: Partial<FoodLogEntryRow> = {}): FoodLogEntryRow {
  return {
    id: LOG_ID,
    userId: 'user-1',
    loggedDate: '2026-06-29',
    meal: 'breakfast',
    foodId: FOOD_ID,
    recipeId: null,
    itemName: 'Chicken breast',
    unit: 'grams',
    quantity: 200,
    kcal: 330,
    proteinG: 62,
    carbsG: 0,
    fatG: 7.2,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('food-log create route (snapshot)', () => {
  it('POST /api/food-log for a food snapshots scaled macros + name', async () => {
    repo.findFoodById.mockResolvedValue(fakeFood());
    repo.createFoodLogEntry.mockResolvedValue(fakeLogEntry());

    const res = await request('POST', '/api/food-log', {
      cookie: await authCookie(),
      body: {
        type: 'food',
        foodId: FOOD_ID,
        quantity: 200,
        meal: 'breakfast',
        loggedDate: '2026-06-29',
      },
    });

    expect(res.status).toBe(201);
    // Chicken 200g @ 165/31/0/3.6 per 100g -> 330/62/0/7.2.
    expect(repo.createFoodLogEntry).toHaveBeenCalledWith({
      userId: 'user-1',
      loggedDate: '2026-06-29',
      meal: 'breakfast',
      foodId: FOOD_ID,
      recipeId: null,
      itemName: 'Chicken breast',
      unit: 'grams',
      quantity: 200,
      kcal: 330,
      proteinG: 62,
      carbsG: 0,
      fatG: 7.2,
    });
  });

  it('POST /api/food-log for a food by servings scales its serving weight', async () => {
    repo.findFoodById.mockResolvedValue(fakeFood({ servingGrams: 150 }));
    repo.createFoodLogEntry.mockResolvedValue(fakeLogEntry());

    const res = await request('POST', '/api/food-log', {
      cookie: await authCookie(),
      body: {
        type: 'food',
        foodId: FOOD_ID,
        quantity: 2,
        unit: 'servings',
        meal: 'breakfast',
        loggedDate: '2026-06-29',
      },
    });

    expect(res.status).toBe(201);
    // 2 servings x 150g = 300g @ 165/31/0/3.6 per 100g -> 495/93/0/10.8.
    expect(repo.createFoodLogEntry).toHaveBeenCalledWith({
      userId: 'user-1',
      loggedDate: '2026-06-29',
      meal: 'breakfast',
      foodId: FOOD_ID,
      recipeId: null,
      itemName: 'Chicken breast',
      unit: 'servings',
      quantity: 2,
      kcal: 495,
      proteinG: 93,
      carbsG: 0,
      fatG: 10.8,
    });
  });

  it('POST /api/food-log for a food by servings with no serving size returns 400', async () => {
    repo.findFoodById.mockResolvedValue(fakeFood({ servingGrams: null }));

    const res = await request('POST', '/api/food-log', {
      cookie: await authCookie(),
      body: {
        type: 'food',
        foodId: FOOD_ID,
        quantity: 1,
        unit: 'servings',
        meal: 'breakfast',
        loggedDate: '2026-06-29',
      },
    });

    expect(res.status).toBe(400);
    expect(repo.createFoodLogEntry).not.toHaveBeenCalled();
  });

  it('POST /api/food-log for a recipe by servings snapshots per-serving x servings', async () => {
    repo.findRecipeById.mockResolvedValue(fakeRecipe());
    repo.listRecipeIngredientsWithFood.mockResolvedValue(INGREDIENT_LINES);
    repo.createFoodLogEntry.mockResolvedValue(fakeLogEntry({ recipeId: RECIPE_ID, foodId: null }));

    const res = await request('POST', '/api/food-log', {
      cookie: await authCookie(),
      body: {
        type: 'recipe',
        recipeId: RECIPE_ID,
        quantity: 2,
        unit: 'servings',
        meal: 'dinner',
        loggedDate: '2026-06-29',
      },
    });

    expect(res.status).toBe(201);
    // perServing 402.5/38.5/15/19.25 x 2 servings -> 805/77/30/38.5.
    expect(repo.createFoodLogEntry).toHaveBeenCalledWith({
      userId: 'user-1',
      loggedDate: '2026-06-29',
      meal: 'dinner',
      foodId: null,
      recipeId: RECIPE_ID,
      itemName: 'Chili',
      unit: 'servings',
      quantity: 2,
      kcal: 805,
      proteinG: 77,
      carbsG: 30,
      fatG: 38.5,
    });
  });

  it('POST /api/food-log for a recipe by grams snapshots per-gram x grams', async () => {
    repo.findRecipeById.mockResolvedValue(fakeRecipe());
    repo.listRecipeIngredientsWithFood.mockResolvedValue(INGREDIENT_LINES);
    repo.createFoodLogEntry.mockResolvedValue(fakeLogEntry({ recipeId: RECIPE_ID, foodId: null }));

    const res = await request('POST', '/api/food-log', {
      cookie: await authCookie(),
      body: {
        type: 'recipe',
        recipeId: RECIPE_ID,
        quantity: 450,
        unit: 'grams',
        meal: 'lunch',
        loggedDate: '2026-06-29',
      },
    });

    expect(res.status).toBe(201);
    // Recipe is 1610/154/60/77 over 900g; 450g is half -> 805/77/30/38.5.
    expect(repo.createFoodLogEntry).toHaveBeenCalledWith({
      userId: 'user-1',
      loggedDate: '2026-06-29',
      meal: 'lunch',
      foodId: null,
      recipeId: RECIPE_ID,
      itemName: 'Chili',
      unit: 'grams',
      quantity: 450,
      kcal: 805,
      proteinG: 77,
      carbsG: 30,
      fatG: 38.5,
    });
  });

  it('POST /api/food-log for a missing/inactive food returns 400', async () => {
    repo.findFoodById.mockResolvedValue(undefined);

    const res = await request('POST', '/api/food-log', {
      cookie: await authCookie(),
      body: {
        type: 'food',
        foodId: FOOD_ID,
        quantity: 200,
        meal: 'breakfast',
        loggedDate: '2026-06-29',
      },
    });

    expect(res.status).toBe(400);
    expect(repo.createFoodLogEntry).not.toHaveBeenCalled();
  });

  it('POST /api/food-log with an unknown discriminator type returns 400', async () => {
    const res = await request('POST', '/api/food-log', {
      cookie: await authCookie(),
      body: { type: 'snack', foodId: FOOD_ID, quantity: 200, loggedDate: '2026-06-29' },
    });

    expect(res.status).toBe(400);
  });
});

describe('food-log read/update/delete routes', () => {
  it('GET /api/food-log returns the day entries and summed totals', async () => {
    repo.listFoodLogByDate.mockResolvedValue([
      fakeLogEntry({ kcal: 330, proteinG: 62, carbsG: 0, fatG: 7 }),
      fakeLogEntry({ id: 'e2', kcal: 200, proteinG: 10, carbsG: 20, fatG: 5 }),
    ]);

    const res = await request('GET', '/api/food-log?date=2026-06-29', {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as { data: { totals: Record<string, number> } };

    expect(res.status).toBe(200);
    expect(body.data.totals).toEqual({ kcal: 530, proteinG: 72, carbsG: 20, fatG: 12 });
    expect(repo.listFoodLogByDate).toHaveBeenCalledWith('user-1', '2026-06-29');
  });

  it('GET /api/food-log without a date returns 400', async () => {
    const res = await request('GET', '/api/food-log', { cookie: await authCookie() });

    expect(res.status).toBe(400);
    expect(repo.listFoodLogByDate).not.toHaveBeenCalled();
  });

  it('PATCH /api/food-log/:id rescales the snapshot by the quantity ratio', async () => {
    repo.findFoodLogEntryById.mockResolvedValue(fakeLogEntry());
    repo.updateFoodLogEntry.mockResolvedValue(fakeLogEntry({ quantity: 100 }));

    const res = await request('PATCH', `/api/food-log/${LOG_ID}`, {
      cookie: await authCookie(),
      body: { quantity: 100 },
    });

    expect(res.status).toBe(200);
    // 200g -> 100g halves the stored 330/62/0/7.2 snapshot.
    expect(repo.updateFoodLogEntry).toHaveBeenCalledWith('user-1', LOG_ID, {
      quantity: 100,
      kcal: 165,
      proteinG: 31,
      carbsG: 0,
      fatG: 3.6,
    });
  });

  it("PATCH /api/food-log/:id returns 404 when the entry is not the user's", async () => {
    repo.findFoodLogEntryById.mockResolvedValue(undefined);

    const res = await request('PATCH', `/api/food-log/${LOG_ID}`, {
      cookie: await authCookie(),
      body: { quantity: 100 },
    });

    expect(res.status).toBe(404);
    expect(repo.updateFoodLogEntry).not.toHaveBeenCalled();
  });

  it('DELETE /api/food-log/:id deletes and returns success', async () => {
    repo.deleteFoodLogEntry.mockResolvedValue(fakeLogEntry());

    const res = await request('DELETE', `/api/food-log/${LOG_ID}`, { cookie: await authCookie() });
    const body = (await res.json()) as { data: { success: boolean } };

    expect(res.status).toBe(200);
    expect(body.data.success).toBe(true);
  });

  it('DELETE /api/food-log/:id returns 404 when the entry is not found', async () => {
    repo.deleteFoodLogEntry.mockResolvedValue(undefined);

    const res = await request('DELETE', `/api/food-log/${LOG_ID}`, { cookie: await authCookie() });

    expect(res.status).toBe(404);
  });
});

describe('recent diary items route', () => {
  it('GET /api/food-log/recent ranks by use count then recency and maps to source refs', async () => {
    repo.findRecentDiaryRows.mockResolvedValue([
      { type: 'food', id: FOOD_ID, name: 'Banana', count: 1, lastDate: '2026-06-28' },
      { type: 'recipe', id: RECIPE_ID, name: 'Chili', count: 5, lastDate: '2026-06-20' },
      { type: 'food', id: 'food-2', name: 'Eggs', count: 5, lastDate: '2026-06-29' },
    ]);

    const res = await request('GET', '/api/food-log/recent?meal=breakfast', {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as { data: { type: string; id: string; name: string }[] };

    expect(res.status).toBe(200);
    // count 5 before count 1; within count 5, the more recent (Eggs) first.
    expect(body.data).toEqual([
      { type: 'food', id: 'food-2', name: 'Eggs' },
      { type: 'recipe', id: RECIPE_ID, name: 'Chili' },
      { type: 'food', id: FOOD_ID, name: 'Banana' },
    ]);
    expect(repo.findRecentDiaryRows).toHaveBeenCalledWith(
      'user-1',
      'breakfast',
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
  });

  it('GET /api/food-log/recent without a meal returns 400', async () => {
    const res = await request('GET', '/api/food-log/recent', { cookie: await authCookie() });

    expect(res.status).toBe(400);
    expect(repo.findRecentDiaryRows).not.toHaveBeenCalled();
  });
});

const TARGET_ID = '77777777-7777-4777-8777-777777777777';
const VALID_TARGET = { kcal: 2000, proteinG: 150, carbsG: 200, fatG: 60 };

function fakeTarget(overrides: Partial<NutritionTargetRow> = {}): NutritionTargetRow {
  return {
    id: TARGET_ID,
    userId: 'user-1',
    effectiveDate: '2026-06-29',
    kcal: 2000,
    proteinG: 150,
    carbsG: 200,
    fatG: 60,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('nutrition target routes', () => {
  it('GET /api/nutrition-targets/current returns the most recent target', async () => {
    repo.findCurrentTarget.mockResolvedValue(fakeTarget());

    const res = await request('GET', '/api/nutrition-targets/current', {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as { data: NutritionTargetRow | null };

    expect(res.status).toBe(200);
    expect(body.data?.kcal).toBe(2000);
  });

  it('GET /api/nutrition-targets/current returns null when none is set', async () => {
    repo.findCurrentTarget.mockResolvedValue(undefined);

    const res = await request('GET', '/api/nutrition-targets/current', {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as { data: NutritionTargetRow | null };

    expect(res.status).toBe(200);
    expect(body.data).toBeNull();
  });

  it('GET /api/nutrition-targets returns the history', async () => {
    repo.listTargets.mockResolvedValue([
      fakeTarget({ id: 'old', effectiveDate: '2026-01-15', kcal: 2200 }),
      fakeTarget(),
    ]);

    const res = await request('GET', '/api/nutrition-targets', { cookie: await authCookie() });
    const body = (await res.json()) as { data: NutritionTargetRow[] };

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
  });

  it("PUT /api/nutrition-targets upserts today's target", async () => {
    repo.upsertTargetOnDate.mockResolvedValue(fakeTarget());

    const res = await request('PUT', '/api/nutrition-targets', {
      cookie: await authCookie(),
      body: VALID_TARGET,
    });

    expect(res.status).toBe(200);
    expect(repo.upsertTargetOnDate).toHaveBeenCalledWith(
      'user-1',
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      VALID_TARGET,
    );
  });

  it('PUT /api/nutrition-targets with effectiveDate back-fills that date', async () => {
    repo.upsertTargetOnDate.mockResolvedValue(fakeTarget());
    const body = { ...VALID_TARGET, effectiveDate: '2026-01-01' };

    const res = await request('PUT', '/api/nutrition-targets', {
      cookie: await authCookie(),
      body,
    });

    expect(res.status).toBe(200);
    expect(repo.upsertTargetOnDate).toHaveBeenCalledWith('user-1', '2026-01-01', body);
  });

  it('PUT /api/nutrition-targets with a missing macro returns 400', async () => {
    const res = await request('PUT', '/api/nutrition-targets', {
      cookie: await authCookie(),
      body: { kcal: 2000, proteinG: 150, carbsG: 200 },
    });

    expect(res.status).toBe(400);
    expect(repo.upsertTargetOnDate).not.toHaveBeenCalled();
  });
});
