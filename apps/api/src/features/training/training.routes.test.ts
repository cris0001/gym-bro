import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../app';
import type { Exercise } from '../../db/schema/exercises';
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
