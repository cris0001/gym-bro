import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../app';
import type { Exercise } from '../../db/schema/exercises';
import type { TrainingPlan } from '../../db/schema/training-plans';
import type { WorkoutTemplate } from '../../db/schema/workout-templates';
import type { WorkoutTag } from '../../db/schema/workout-tags';
import { AUTH_COOKIE_NAME } from '../../lib/auth-cookie';
import { signToken } from '../../lib/jwt';
import * as trainingRepository from './training.repository';

// Mock the repository (the Drizzle boundary) so tests drive the real Hono app
// and real service over fake rows — no database. The repository's actual SQL is
// covered by the live smoke test, not here. Mirrors the auth feature's tests.
vi.mock('./training.repository');
const repo = vi.mocked(trainingRepository);

function fakeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    userId: 'user-1',
    name: 'Bench Press',
    category: 'Chest',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function fakeTag(overrides: Partial<WorkoutTag> = {}): WorkoutTag {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    userId: 'user-1',
    name: 'PR',
    color: '#22c55e',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function fakePlan(overrides: Partial<TrainingPlan> = {}): TrainingPlan {
  return {
    id: '33333333-3333-4333-8333-333333333333',
    userId: 'user-1',
    name: 'PPL',
    description: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function fakeTemplate(overrides: Partial<WorkoutTemplate> = {}): WorkoutTemplate {
  return {
    id: '44444444-4444-4444-8444-444444444444',
    trainingPlanId: fakePlan().id,
    userId: 'user-1',
    name: 'Push',
    description: null,
    position: 0,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

// A Postgres unique_violation as Drizzle surfaces it: the driver error (with the
// 23505 code) is wrapped, so the code lives on `cause`. Exercises the service's
// isUniqueViolation unwrap that the 500-vs-409 smoke-test bug fix added.
const uniqueViolation = new Error('duplicate key value', { cause: { code: '23505' } });

const JSON_HEADERS = { 'content-type': 'application/json' };

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

describe('exercise routes', () => {
  it('GET /api/exercises without a cookie returns 401', async () => {
    const res = await request('GET', '/api/exercises');

    expect(res.status).toBe(401);
    expect(repo.listExercises).not.toHaveBeenCalled();
  });

  it('GET /api/exercises returns the active list with no category filter', async () => {
    repo.listExercises.mockResolvedValue([fakeExercise()]);

    const res = await request('GET', '/api/exercises', { cookie: await authCookie() });
    const body = (await res.json()) as { data: Exercise[] };

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(repo.listExercises).toHaveBeenCalledWith('user-1', undefined);
  });

  it('GET /api/exercises?category=Back forwards the category to the repository', async () => {
    repo.listExercises.mockResolvedValue([]);

    const res = await request('GET', '/api/exercises?category=Back', {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(200);
    expect(repo.listExercises).toHaveBeenCalledWith('user-1', 'Back');
  });

  it('GET /api/exercises with an unknown category returns 400', async () => {
    const res = await request('GET', '/api/exercises?category=Nonsense', {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(400);
    expect(repo.listExercises).not.toHaveBeenCalled();
  });

  it('POST /api/exercises creates an exercise scoped to the user and returns 201', async () => {
    repo.createExercise.mockResolvedValue(fakeExercise());

    const res = await request('POST', '/api/exercises', {
      cookie: await authCookie(),
      body: { name: 'Bench Press', category: 'Chest' },
    });
    const body = (await res.json()) as { data: Exercise };

    expect(res.status).toBe(201);
    expect(body.data.name).toBe('Bench Press');
    expect(repo.createExercise).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'Bench Press',
      category: 'Chest',
    });
  });

  it('POST /api/exercises maps a duplicate name (drizzle-wrapped 23505) to 409', async () => {
    repo.createExercise.mockRejectedValue(uniqueViolation);

    const res = await request('POST', '/api/exercises', {
      cookie: await authCookie(),
      body: { name: 'Bench Press', category: 'Chest' },
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('POST /api/exercises with an invalid body returns 400 with field details', async () => {
    const res = await request('POST', '/api/exercises', {
      cookie: await authCookie(),
      body: { name: '', category: 'Nonsense' },
    });
    const body = (await res.json()) as {
      error: { code: string; details?: Record<string, string[]> };
    };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toHaveProperty('name');
    expect(body.error.details).toHaveProperty('category');
    expect(repo.createExercise).not.toHaveBeenCalled();
  });

  it('PATCH /api/exercises/:id updates an existing exercise', async () => {
    repo.findExerciseById.mockResolvedValue(fakeExercise());
    repo.updateExercise.mockResolvedValue(fakeExercise({ name: 'Incline Bench' }));

    const res = await request('PATCH', `/api/exercises/${fakeExercise().id}`, {
      cookie: await authCookie(),
      body: { name: 'Incline Bench' },
    });
    const body = (await res.json()) as { data: Exercise };

    expect(res.status).toBe(200);
    expect(body.data.name).toBe('Incline Bench');
  });

  it('PATCH /api/exercises/:id on a missing or deleted exercise returns 404', async () => {
    repo.findExerciseById.mockResolvedValue(undefined);

    const res = await request('PATCH', `/api/exercises/${fakeExercise().id}`, {
      cookie: await authCookie(),
      body: { name: 'Incline Bench' },
    });

    expect(res.status).toBe(404);
    expect(repo.updateExercise).not.toHaveBeenCalled();
  });

  it('PATCH /api/exercises/:id with a non-uuid id returns 404 without querying', async () => {
    const res = await request('PATCH', '/api/exercises/not-a-uuid', {
      cookie: await authCookie(),
      body: { name: 'Incline Bench' },
    });

    expect(res.status).toBe(404);
    expect(repo.findExerciseById).not.toHaveBeenCalled();
  });

  it('DELETE /api/exercises/:id soft-deletes and returns success', async () => {
    repo.softDeleteExercise.mockResolvedValue(fakeExercise({ isActive: false }));

    const res = await request('DELETE', `/api/exercises/${fakeExercise().id}`, {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as { data: { success: boolean } };

    expect(res.status).toBe(200);
    expect(body.data.success).toBe(true);
  });

  it('DELETE /api/exercises/:id on a missing or already-deleted exercise returns 404', async () => {
    repo.softDeleteExercise.mockResolvedValue(undefined);

    const res = await request('DELETE', `/api/exercises/${fakeExercise().id}`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(404);
  });
});

describe('tag routes', () => {
  it('GET /api/tags without a cookie returns 401', async () => {
    const res = await request('GET', '/api/tags');

    expect(res.status).toBe(401);
    expect(repo.listTags).not.toHaveBeenCalled();
  });

  it('GET /api/tags returns the active list scoped to the user', async () => {
    repo.listTags.mockResolvedValue([fakeTag()]);

    const res = await request('GET', '/api/tags', { cookie: await authCookie() });
    const body = (await res.json()) as { data: WorkoutTag[] };

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(repo.listTags).toHaveBeenCalledWith('user-1');
  });

  it('POST /api/tags creates a tag scoped to the user and returns 201', async () => {
    repo.createTag.mockResolvedValue(fakeTag());

    const res = await request('POST', '/api/tags', {
      cookie: await authCookie(),
      body: { name: 'PR', color: '#22c55e' },
    });
    const body = (await res.json()) as { data: WorkoutTag };

    expect(res.status).toBe(201);
    expect(body.data.name).toBe('PR');
    expect(repo.createTag).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'PR',
      color: '#22c55e',
    });
  });

  it('POST /api/tags maps a duplicate name (drizzle-wrapped 23505) to 409', async () => {
    repo.createTag.mockRejectedValue(uniqueViolation);

    const res = await request('POST', '/api/tags', {
      cookie: await authCookie(),
      body: { name: 'PR', color: '#22c55e' },
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('POST /api/tags with an empty name and bad color returns 400 with field details', async () => {
    const res = await request('POST', '/api/tags', {
      cookie: await authCookie(),
      body: { name: '', color: 'not-a-hex' },
    });
    const body = (await res.json()) as {
      error: { code: string; details?: Record<string, string[]> };
    };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toHaveProperty('name');
    expect(body.error.details).toHaveProperty('color');
    expect(repo.createTag).not.toHaveBeenCalled();
  });

  it('PATCH /api/tags/:id updates an existing tag', async () => {
    repo.findTagById.mockResolvedValue(fakeTag());
    repo.updateTag.mockResolvedValue(fakeTag({ name: 'Deload' }));

    const res = await request('PATCH', `/api/tags/${fakeTag().id}`, {
      cookie: await authCookie(),
      body: { name: 'Deload' },
    });
    const body = (await res.json()) as { data: WorkoutTag };

    expect(res.status).toBe(200);
    expect(body.data.name).toBe('Deload');
  });

  it('PATCH /api/tags/:id on a missing or deleted tag returns 404', async () => {
    repo.findTagById.mockResolvedValue(undefined);

    const res = await request('PATCH', `/api/tags/${fakeTag().id}`, {
      cookie: await authCookie(),
      body: { name: 'Deload' },
    });

    expect(res.status).toBe(404);
    expect(repo.updateTag).not.toHaveBeenCalled();
  });

  it('PATCH /api/tags/:id with a non-uuid id returns 404 without querying', async () => {
    const res = await request('PATCH', '/api/tags/not-a-uuid', {
      cookie: await authCookie(),
      body: { name: 'Deload' },
    });

    expect(res.status).toBe(404);
    expect(repo.findTagById).not.toHaveBeenCalled();
  });

  it('DELETE /api/tags/:id soft-deletes and returns success', async () => {
    repo.softDeleteTag.mockResolvedValue(fakeTag({ isActive: false }));

    const res = await request('DELETE', `/api/tags/${fakeTag().id}`, {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as { data: { success: boolean } };

    expect(res.status).toBe(200);
    expect(body.data.success).toBe(true);
  });

  it('DELETE /api/tags/:id on a missing or already-deleted tag returns 404', async () => {
    repo.softDeleteTag.mockResolvedValue(undefined);

    const res = await request('DELETE', `/api/tags/${fakeTag().id}`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(404);
  });
});

describe('plan routes', () => {
  it('GET /api/plans without a cookie returns 401', async () => {
    const res = await request('GET', '/api/plans');

    expect(res.status).toBe(401);
    expect(repo.listPlansWithTemplateCount).not.toHaveBeenCalled();
  });

  it('GET /api/plans returns plans with their template counts', async () => {
    repo.listPlansWithTemplateCount.mockResolvedValue([{ ...fakePlan(), templateCount: 2 }]);

    const res = await request('GET', '/api/plans', { cookie: await authCookie() });
    const body = (await res.json()) as { data: (TrainingPlan & { templateCount: number })[] };

    expect(res.status).toBe(200);
    expect(body.data[0]?.templateCount).toBe(2);
    expect(repo.listPlansWithTemplateCount).toHaveBeenCalledWith('user-1');
  });

  it('GET /api/plans/:id returns the plan with its ordered templates', async () => {
    repo.findPlanById.mockResolvedValue(fakePlan());
    repo.listTemplatesByPlan.mockResolvedValue([
      fakeTemplate({ name: 'Push', position: 0 }),
      fakeTemplate({ id: '44444444-4444-4444-8444-444444444445', name: 'Pull', position: 1 }),
    ]);

    const res = await request('GET', `/api/plans/${fakePlan().id}`, { cookie: await authCookie() });
    const body = (await res.json()) as { data: TrainingPlan & { templates: WorkoutTemplate[] } };

    expect(res.status).toBe(200);
    expect(body.data.templates).toHaveLength(2);
    expect(body.data.templates[0]?.name).toBe('Push');
    expect(repo.listTemplatesByPlan).toHaveBeenCalledWith('user-1', fakePlan().id);
  });

  it('GET /api/plans/:id on a missing plan returns 404 without loading templates', async () => {
    repo.findPlanById.mockResolvedValue(undefined);

    const res = await request('GET', `/api/plans/${fakePlan().id}`, { cookie: await authCookie() });

    expect(res.status).toBe(404);
    expect(repo.listTemplatesByPlan).not.toHaveBeenCalled();
  });

  it('GET /api/plans/:id with a non-uuid id returns 404 without querying', async () => {
    const res = await request('GET', '/api/plans/not-a-uuid', { cookie: await authCookie() });

    expect(res.status).toBe(404);
    expect(repo.findPlanById).not.toHaveBeenCalled();
  });

  it('POST /api/plans creates a plan scoped to the user and returns 201', async () => {
    repo.createPlan.mockResolvedValue(fakePlan({ description: 'Push pull legs' }));

    const res = await request('POST', '/api/plans', {
      cookie: await authCookie(),
      body: { name: 'PPL', description: 'Push pull legs' },
    });
    const body = (await res.json()) as { data: TrainingPlan };

    expect(res.status).toBe(201);
    expect(body.data.name).toBe('PPL');
    expect(repo.createPlan).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'PPL',
      description: 'Push pull legs',
    });
  });

  it('POST /api/plans maps a duplicate name (drizzle-wrapped 23505) to 409', async () => {
    repo.createPlan.mockRejectedValue(uniqueViolation);

    const res = await request('POST', '/api/plans', {
      cookie: await authCookie(),
      body: { name: 'PPL' },
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('POST /api/plans with an empty name returns 400 with field details', async () => {
    const res = await request('POST', '/api/plans', {
      cookie: await authCookie(),
      body: { name: '' },
    });
    const body = (await res.json()) as {
      error: { code: string; details?: Record<string, string[]> };
    };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toHaveProperty('name');
    expect(repo.createPlan).not.toHaveBeenCalled();
  });

  it('PATCH /api/plans/:id updates an existing plan', async () => {
    repo.findPlanById.mockResolvedValue(fakePlan());
    repo.updatePlan.mockResolvedValue(fakePlan({ name: 'Upper/Lower' }));

    const res = await request('PATCH', `/api/plans/${fakePlan().id}`, {
      cookie: await authCookie(),
      body: { name: 'Upper/Lower' },
    });
    const body = (await res.json()) as { data: TrainingPlan };

    expect(res.status).toBe(200);
    expect(body.data.name).toBe('Upper/Lower');
  });

  it('PATCH /api/plans/:id on a missing plan returns 404', async () => {
    repo.findPlanById.mockResolvedValue(undefined);

    const res = await request('PATCH', `/api/plans/${fakePlan().id}`, {
      cookie: await authCookie(),
      body: { name: 'Upper/Lower' },
    });

    expect(res.status).toBe(404);
    expect(repo.updatePlan).not.toHaveBeenCalled();
  });

  it('DELETE /api/plans/:id hard-deletes and returns success', async () => {
    repo.deletePlan.mockResolvedValue(fakePlan());

    const res = await request('DELETE', `/api/plans/${fakePlan().id}`, {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as { data: { success: boolean } };

    expect(res.status).toBe(200);
    expect(body.data.success).toBe(true);
  });

  it('DELETE /api/plans/:id on a missing plan returns 404', async () => {
    repo.deletePlan.mockResolvedValue(undefined);

    const res = await request('DELETE', `/api/plans/${fakePlan().id}`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(404);
  });
});
