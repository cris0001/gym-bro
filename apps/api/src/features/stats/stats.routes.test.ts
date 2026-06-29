import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ExerciseProgressPoint, RatingTrendPoint, StatExercise } from '@gym-bro/shared';

import { app } from '../../app';
import { AUTH_COOKIE_NAME } from '../../lib/auth-cookie';
import { signToken } from '../../lib/jwt';
import * as statsRepository from './stats.repository';

// Mock the Drizzle boundary so tests drive the real Hono app + service over fake
// rows. These are read-only routes, so only the stats repository is mocked.
vi.mock('./stats.repository');
const repo = vi.mocked(statsRepository);

const EXERCISE_ID = '11111111-1111-4111-8111-111111111111';
const SESSION_ID = '77777777-7777-4777-8777-777777777777';

async function authCookie(userId = 'user-1'): Promise<string> {
  return `${AUTH_COOKIE_NAME}=${await signToken(userId)}`;
}

function request(method: string, path: string, opts: { cookie?: string } = {}) {
  const headers: Record<string, string> = {};
  if (opts.cookie) headers.cookie = opts.cookie;
  return app.request(path, { method, headers });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('stats exercise-picker route', () => {
  it('GET /api/stats/exercises returns the logged exercises, scoped to the user', async () => {
    repo.listExercisesWithHistory.mockResolvedValue([
      { id: EXERCISE_ID, name: 'Bench Press', category: 'Chest' },
    ]);

    const res = await request('GET', '/api/stats/exercises', { cookie: await authCookie() });
    const body = (await res.json()) as { data: StatExercise[] };

    expect(res.status).toBe(200);
    expect(body.data).toEqual([{ id: EXERCISE_ID, name: 'Bench Press', category: 'Chest' }]);
    expect(repo.listExercisesWithHistory).toHaveBeenCalledWith('user-1');
  });

  it('GET /api/stats/exercises without auth returns 401', async () => {
    const res = await request('GET', '/api/stats/exercises');

    expect(res.status).toBe(401);
    expect(repo.listExercisesWithHistory).not.toHaveBeenCalled();
  });
});

describe('stats exercise-progress route', () => {
  it('maps performedDate to date and forwards the from/to window', async () => {
    repo.findExerciseProgress.mockResolvedValue([
      {
        sessionId: SESSION_ID,
        performedDate: '2026-06-29',
        maxWeight: 100,
        totalVolume: 5000,
        setCount: 5,
      },
    ]);

    const res = await request(
      'GET',
      `/api/stats/exercises/${EXERCISE_ID}/progress?from=2026-01-01&to=2026-06-30`,
      { cookie: await authCookie() },
    );
    const body = (await res.json()) as { data: ExerciseProgressPoint[] };

    expect(res.status).toBe(200);
    expect(body.data).toEqual([
      { sessionId: SESSION_ID, date: '2026-06-29', maxWeight: 100, totalVolume: 5000, setCount: 5 },
    ]);
    expect(repo.findExerciseProgress).toHaveBeenCalledWith(
      'user-1',
      EXERCISE_ID,
      '2026-01-01',
      '2026-06-30',
    );
  });

  it('passes undefined bounds when no range is given (all history)', async () => {
    repo.findExerciseProgress.mockResolvedValue([]);

    const res = await request('GET', `/api/stats/exercises/${EXERCISE_ID}/progress`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(200);
    expect(repo.findExerciseProgress).toHaveBeenCalledWith(
      'user-1',
      EXERCISE_ID,
      undefined,
      undefined,
    );
  });

  it('returns 404 for a non-uuid exerciseId without touching the repository', async () => {
    const res = await request('GET', '/api/stats/exercises/not-a-uuid/progress', {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(404);
    expect(repo.findExerciseProgress).not.toHaveBeenCalled();
  });

  it('returns 400 when from is after to', async () => {
    const res = await request(
      'GET',
      `/api/stats/exercises/${EXERCISE_ID}/progress?from=2026-06-30&to=2026-01-01`,
      { cookie: await authCookie() },
    );

    expect(res.status).toBe(400);
    expect(repo.findExerciseProgress).not.toHaveBeenCalled();
  });
});

describe('stats rating-trend route', () => {
  it('maps performedDate to date', async () => {
    repo.findRatingTrend.mockResolvedValue([
      {
        sessionId: SESSION_ID,
        performedDate: '2026-06-29',
        rating: 4,
        name: 'Push',
        sessionType: 'strength',
      },
    ]);

    const res = await request('GET', '/api/stats/rating-trend', { cookie: await authCookie() });
    const body = (await res.json()) as { data: RatingTrendPoint[] };

    expect(res.status).toBe(200);
    expect(body.data).toEqual([
      {
        sessionId: SESSION_ID,
        date: '2026-06-29',
        rating: 4,
        name: 'Push',
        sessionType: 'strength',
      },
    ]);
  });

  it('returns 400 for an invalid from date', async () => {
    const res = await request('GET', '/api/stats/rating-trend?from=nope', {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(400);
    expect(repo.findRatingTrend).not.toHaveBeenCalled();
  });
});
