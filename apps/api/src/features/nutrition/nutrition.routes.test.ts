import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../app';
import { AUTH_COOKIE_NAME } from '../../lib/auth-cookie';
import { signToken } from '../../lib/jwt';
import type { FoodRow } from './nutrition.repository';
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
