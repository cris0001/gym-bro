import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../app';
import type { Exercise } from '../../db/schema/exercises';
import type { PlannedSession } from '../../db/schema/planned-sessions';
import type { WorkoutSession } from '../../db/schema/workout-sessions';
import type { WorkoutTemplate } from '../../db/schema/workout-templates';
import { AUTH_COOKIE_NAME } from '../../lib/auth-cookie';
import { signToken } from '../../lib/jwt';
import * as trainingRepository from '../training/training.repository';
import type { PlannedSessionWithTemplateRow } from './sessions.repository';
import * as sessionsRepository from './sessions.repository';

// Mock both Drizzle boundaries so tests drive the real Hono app + services over
// fake rows. The service reaches into training's findTemplateById for the
// ownership chain, so that module is mocked too.
vi.mock('./sessions.repository');
vi.mock('../training/training.repository');
const repo = vi.mocked(sessionsRepository);
const trainingRepo = vi.mocked(trainingRepository);

const TEMPLATE_ID = '44444444-4444-4444-8444-444444444444';
const PLANNED_ID = '66666666-6666-4666-8666-666666666666';
const EXERCISE_ID = '11111111-1111-4111-8111-111111111111';
const TAG_ID = '22222222-2222-4222-8222-222222222222';
const SESSION_ID = '77777777-7777-4777-8777-777777777777';
const PERF_ID = '88888888-8888-4888-8888-888888888888';

function fakeTemplate(overrides: Partial<WorkoutTemplate> = {}): WorkoutTemplate {
  return {
    id: TEMPLATE_ID,
    trainingPlanId: '33333333-3333-4333-8333-333333333333',
    userId: 'user-1',
    name: 'Push',
    description: null,
    position: 0,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function fakePlanned(overrides: Partial<PlannedSession> = {}): PlannedSession {
  return {
    id: PLANNED_ID,
    userId: 'user-1',
    workoutTemplateId: TEMPLATE_ID,
    scheduledDate: '2026-06-29',
    status: 'planned',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function fakeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: EXERCISE_ID,
    userId: 'user-1',
    name: 'Bench Press',
    category: 'Chest',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function fakeWorkoutSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: SESSION_ID,
    userId: 'user-1',
    plannedSessionId: null,
    workoutTemplateId: null,
    sessionType: 'strength',
    name: 'Push',
    performedDate: '2026-06-29',
    durationMinutes: null,
    rating: null,
    notes: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

// A Postgres unique_violation as Drizzle surfaces it (code on the cause).
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

describe('planned session routes', () => {
  it('POST /api/planned-sessions assigns a template the user owns and returns 201', async () => {
    trainingRepo.findTemplateById.mockResolvedValue(fakeTemplate());
    repo.createPlannedSession.mockResolvedValue(fakePlanned());

    const res = await request('POST', '/api/planned-sessions', {
      cookie: await authCookie(),
      body: { workoutTemplateId: TEMPLATE_ID, scheduledDate: '2026-06-29' },
    });
    const body = (await res.json()) as { data: PlannedSession };

    expect(res.status).toBe(201);
    expect(body.data.id).toBe(PLANNED_ID);
    expect(repo.createPlannedSession).toHaveBeenCalledWith({
      userId: 'user-1',
      workoutTemplateId: TEMPLATE_ID,
      scheduledDate: '2026-06-29',
    });
  });

  it('POST /api/planned-sessions with a template the user does not own returns 404', async () => {
    trainingRepo.findTemplateById.mockResolvedValue(undefined);

    const res = await request('POST', '/api/planned-sessions', {
      cookie: await authCookie(),
      body: { workoutTemplateId: TEMPLATE_ID, scheduledDate: '2026-06-29' },
    });

    expect(res.status).toBe(404);
    expect(repo.createPlannedSession).not.toHaveBeenCalled();
  });

  it('POST /api/planned-sessions maps a duplicate (same template + date) to 409', async () => {
    trainingRepo.findTemplateById.mockResolvedValue(fakeTemplate());
    repo.createPlannedSession.mockRejectedValue(uniqueViolation);

    const res = await request('POST', '/api/planned-sessions', {
      cookie: await authCookie(),
      body: { workoutTemplateId: TEMPLATE_ID, scheduledDate: '2026-06-29' },
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('GET /api/planned-sessions returns the range mapped with the template name', async () => {
    const row: PlannedSessionWithTemplateRow = {
      ...fakePlanned(),
      templateName: 'Push',
      workoutSessionId: null,
    };
    repo.listPlannedSessionsByRange.mockResolvedValue([row]);

    const res = await request('GET', '/api/planned-sessions?from=2026-06-01&to=2026-06-30', {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as {
      data: { id: string; template: { id: string; name: string } }[];
    };

    expect(res.status).toBe(200);
    expect(body.data[0]?.template).toEqual({ id: TEMPLATE_ID, name: 'Push' });
    expect(repo.listPlannedSessionsByRange).toHaveBeenCalledWith(
      'user-1',
      '2026-06-01',
      '2026-06-30',
    );
  });

  it('GET /api/planned-sessions with to before from returns 400', async () => {
    const res = await request('GET', '/api/planned-sessions?from=2026-06-30&to=2026-06-01', {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(400);
    expect(repo.listPlannedSessionsByRange).not.toHaveBeenCalled();
  });

  it('PATCH /api/planned-sessions/:id updates an owned entry', async () => {
    repo.findPlannedSessionById.mockResolvedValue(fakePlanned());
    repo.updatePlannedSession.mockResolvedValue(fakePlanned({ status: 'skipped' }));

    const res = await request('PATCH', `/api/planned-sessions/${PLANNED_ID}`, {
      cookie: await authCookie(),
      body: { status: 'skipped' },
    });
    const body = (await res.json()) as { data: PlannedSession };

    expect(res.status).toBe(200);
    expect(body.data.status).toBe('skipped');
  });

  it('PATCH /api/planned-sessions/:id on an entry the user does not own returns 404', async () => {
    repo.findPlannedSessionById.mockResolvedValue(undefined);

    const res = await request('PATCH', `/api/planned-sessions/${PLANNED_ID}`, {
      cookie: await authCookie(),
      body: { status: 'skipped' },
    });

    expect(res.status).toBe(404);
    expect(repo.updatePlannedSession).not.toHaveBeenCalled();
  });

  it('PATCH /api/planned-sessions/:id maps a reschedule collision to 409', async () => {
    repo.findPlannedSessionById.mockResolvedValue(fakePlanned());
    repo.updatePlannedSession.mockRejectedValue(uniqueViolation);

    const res = await request('PATCH', `/api/planned-sessions/${PLANNED_ID}`, {
      cookie: await authCookie(),
      body: { scheduledDate: '2026-07-01' },
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('DELETE /api/planned-sessions/:id removes an owned entry', async () => {
    repo.deletePlannedSession.mockResolvedValue(fakePlanned());

    const res = await request('DELETE', `/api/planned-sessions/${PLANNED_ID}`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(200);
  });

  it('DELETE /api/planned-sessions/:id on an entry the user does not own returns 404', async () => {
    repo.deletePlannedSession.mockResolvedValue(undefined);

    const res = await request('DELETE', `/api/planned-sessions/${PLANNED_ID}`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(404);
  });
});

describe('workout session routes', () => {
  const strengthBody = {
    name: 'Push',
    performedDate: '2026-06-29',
    performances: [
      {
        originalExerciseId: EXERCISE_ID,
        actualExerciseId: EXERCISE_ID,
        sets: [{ weight: 100, reps: 8, rir: 2 }],
      },
    ],
  };

  it('POST /api/workout-sessions/strength writes the session when all references are owned', async () => {
    trainingRepo.findExerciseById.mockResolvedValue(fakeExercise());
    repo.createStrengthSession.mockResolvedValue(fakeWorkoutSession());

    const res = await request('POST', '/api/workout-sessions/strength', {
      cookie: await authCookie(),
      body: strengthBody,
    });
    const body = (await res.json()) as { data: WorkoutSession };

    expect(res.status).toBe(201);
    expect(body.data.id).toBe(SESSION_ID);
    expect(repo.createStrengthSession).toHaveBeenCalledOnce();
  });

  it('POST /api/workout-sessions/strength with an exercise the user does not own returns 400', async () => {
    trainingRepo.findExerciseById.mockResolvedValue(undefined);

    const res = await request('POST', '/api/workout-sessions/strength', {
      cookie: await authCookie(),
      body: strengthBody,
    });

    expect(res.status).toBe(400);
    expect(repo.createStrengthSession).not.toHaveBeenCalled();
  });

  it('POST /api/workout-sessions/strength with a tag the user does not own returns 400', async () => {
    trainingRepo.findExerciseById.mockResolvedValue(fakeExercise());
    trainingRepo.findTagById.mockResolvedValue(undefined);

    const res = await request('POST', '/api/workout-sessions/strength', {
      cookie: await authCookie(),
      body: { ...strengthBody, tagIds: [TAG_ID] },
    });

    expect(res.status).toBe(400);
    expect(repo.createStrengthSession).not.toHaveBeenCalled();
  });

  it('POST /api/workout-sessions/strength with a planned session the user does not own returns 400', async () => {
    repo.findPlannedSessionById.mockResolvedValue(undefined);

    const res = await request('POST', '/api/workout-sessions/strength', {
      cookie: await authCookie(),
      body: { ...strengthBody, plannedSessionId: PLANNED_ID },
    });

    expect(res.status).toBe(400);
    expect(repo.createStrengthSession).not.toHaveBeenCalled();
  });

  it('POST /api/workout-sessions/activity logs an ad-hoc activity', async () => {
    repo.createActivitySession.mockResolvedValue(
      fakeWorkoutSession({ sessionType: 'activity', name: 'Morning run', durationMinutes: 30 }),
    );

    const res = await request('POST', '/api/workout-sessions/activity', {
      cookie: await authCookie(),
      body: { name: 'Morning run', performedDate: '2026-06-29', durationMinutes: 30 },
    });
    const body = (await res.json()) as { data: WorkoutSession };

    expect(res.status).toBe(201);
    expect(body.data.sessionType).toBe('activity');
  });

  it('GET /api/workout-sessions returns a page with totals and tags', async () => {
    repo.listWorkoutSessionsPage.mockResolvedValue([fakeWorkoutSession()]);
    repo.countWorkoutSessions.mockResolvedValue(1);
    repo.listTagsForSessions.mockResolvedValue([
      { workoutSessionId: SESSION_ID, id: TAG_ID, name: 'PR', color: '#22c55e', isActive: true },
    ]);

    const res = await request('GET', '/api/workout-sessions?limit=20&offset=0', {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as {
      data: { items: { id: string; tags: { id: string }[] }[]; total: number };
    };

    expect(res.status).toBe(200);
    expect(body.data.total).toBe(1);
    expect(body.data.items[0]?.tags).toHaveLength(1);
  });

  it('GET /api/workout-sessions/:id returns the assembled detail', async () => {
    repo.findWorkoutSessionById.mockResolvedValue(fakeWorkoutSession());
    repo.listPerformancesForSession.mockResolvedValue([
      {
        id: PERF_ID,
        workoutSessionId: SESSION_ID,
        userId: 'user-1',
        originalExerciseId: EXERCISE_ID,
        actualExerciseId: EXERCISE_ID,
        position: 0,
        notes: null,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        actual: { id: EXERCISE_ID, name: 'Bench Press', category: 'Chest', isActive: true },
        original: { id: EXERCISE_ID, name: 'Bench Press', category: 'Chest', isActive: true },
      },
    ]);
    repo.listSetsForSession.mockResolvedValue([
      {
        id: '99999999-9999-4999-8999-999999999999',
        exercisePerformanceId: PERF_ID,
        userId: 'user-1',
        position: 0,
        weight: 100,
        reps: 8,
        rir: 2,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      },
    ]);
    repo.listTagsForSessions.mockResolvedValue([]);

    const res = await request('GET', `/api/workout-sessions/${SESSION_ID}`, {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as {
      data: { performances: { exercise: { name: string }; sets: { weight: number }[] }[] };
    };

    expect(res.status).toBe(200);
    expect(body.data.performances[0]?.exercise.name).toBe('Bench Press');
    expect(body.data.performances[0]?.sets[0]?.weight).toBe(100);
  });

  it('GET /api/workout-sessions/:id the user does not own returns 404', async () => {
    repo.findWorkoutSessionById.mockResolvedValue(undefined);

    const res = await request('GET', `/api/workout-sessions/${SESSION_ID}`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(404);
  });

  it('PATCH /api/workout-sessions/:id updates metadata and returns the refreshed detail', async () => {
    // findWorkoutSessionById backs both the ownership check and the refreshed
    // detail returned after the update, so it reflects the new rating.
    repo.findWorkoutSessionById.mockResolvedValue(fakeWorkoutSession({ rating: 5 }));
    repo.updateWorkoutSession.mockResolvedValue(fakeWorkoutSession({ rating: 5 }));
    repo.listPerformancesForSession.mockResolvedValue([]);
    repo.listSetsForSession.mockResolvedValue([]);
    repo.listTagsForSessions.mockResolvedValue([]);

    const res = await request('PATCH', `/api/workout-sessions/${SESSION_ID}`, {
      cookie: await authCookie(),
      body: { rating: 5 },
    });
    const body = (await res.json()) as { data: { rating: number | null } };

    expect(res.status).toBe(200);
    expect(body.data.rating).toBe(5);
  });

  it('PATCH /api/workout-sessions/:id the user does not own returns 404', async () => {
    repo.findWorkoutSessionById.mockResolvedValue(undefined);

    const res = await request('PATCH', `/api/workout-sessions/${SESSION_ID}`, {
      cookie: await authCookie(),
      body: { rating: 5 },
    });

    expect(res.status).toBe(404);
    expect(repo.updateWorkoutSession).not.toHaveBeenCalled();
  });

  it('DELETE /api/workout-sessions/:id removes an owned session', async () => {
    repo.deleteWorkoutSession.mockResolvedValue(fakeWorkoutSession());

    const res = await request('DELETE', `/api/workout-sessions/${SESSION_ID}`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(200);
  });

  it('DELETE /api/workout-sessions/:id reverts a fulfilled planned session to planned', async () => {
    repo.deleteWorkoutSession.mockResolvedValue(
      fakeWorkoutSession({ plannedSessionId: PLANNED_ID }),
    );
    repo.updatePlannedSession.mockResolvedValue(fakePlanned({ status: 'planned' }));

    const res = await request('DELETE', `/api/workout-sessions/${SESSION_ID}`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(200);
    expect(repo.updatePlannedSession).toHaveBeenCalledWith('user-1', PLANNED_ID, {
      status: 'planned',
    });
  });

  it('DELETE /api/workout-sessions/:id the user does not own returns 404', async () => {
    repo.deleteWorkoutSession.mockResolvedValue(undefined);

    const res = await request('DELETE', `/api/workout-sessions/${SESSION_ID}`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(404);
  });

  it('PUT /api/workout-sessions/:id replaces the graph and returns the refreshed detail', async () => {
    repo.findWorkoutSessionById.mockResolvedValue(fakeWorkoutSession({ name: 'Edited' }));
    trainingRepo.findExerciseById.mockResolvedValue(fakeExercise());
    repo.replaceStrengthSession.mockResolvedValue(fakeWorkoutSession({ name: 'Edited' }));
    repo.listPerformancesForSession.mockResolvedValue([]);
    repo.listSetsForSession.mockResolvedValue([]);
    repo.listTagsForSessions.mockResolvedValue([]);

    const res = await request('PUT', `/api/workout-sessions/${SESSION_ID}`, {
      cookie: await authCookie(),
      body: {
        name: 'Edited',
        performedDate: '2026-06-20',
        performances: [
          {
            originalExerciseId: EXERCISE_ID,
            actualExerciseId: EXERCISE_ID,
            sets: [{ weight: 100, reps: 8 }],
          },
        ],
      },
    });
    const body = (await res.json()) as { data: { name: string } };

    expect(res.status).toBe(200);
    expect(body.data.name).toBe('Edited');
    expect(repo.replaceStrengthSession).toHaveBeenCalled();
  });

  it('PUT /api/workout-sessions/:id the user does not own returns 404', async () => {
    repo.findWorkoutSessionById.mockResolvedValue(undefined);

    const res = await request('PUT', `/api/workout-sessions/${SESSION_ID}`, {
      cookie: await authCookie(),
      body: {
        name: 'Edited',
        performedDate: '2026-06-20',
        performances: [
          { originalExerciseId: EXERCISE_ID, actualExerciseId: EXERCISE_ID, sets: [{ reps: 5 }] },
        ],
      },
    });

    expect(res.status).toBe(404);
    expect(repo.replaceStrengthSession).not.toHaveBeenCalled();
  });
});

describe('exercise history route', () => {
  it('GET /api/exercises/:exerciseId/history returns recent performances', async () => {
    trainingRepo.findExerciseById.mockResolvedValue(fakeExercise());
    repo.findExerciseHistory.mockResolvedValue([
      {
        sessionId: SESSION_ID,
        sessionName: 'Push',
        performedDate: '2026-06-22',
        sets: [{ weight: 100, reps: 8, rir: 2 }],
      },
    ]);

    const res = await request('GET', `/api/exercises/${EXERCISE_ID}/history?limit=1`, {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as {
      data: { sessionName: string; sets: { weight: number | null }[] }[];
    };

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.sessionName).toBe('Push');
    expect(body.data[0]?.sets[0]?.weight).toBe(100);
  });

  it('GET /api/exercises/:exerciseId/history for an exercise the user does not own returns 404', async () => {
    trainingRepo.findExerciseById.mockResolvedValue(undefined);

    const res = await request('GET', `/api/exercises/${EXERCISE_ID}/history`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(404);
    expect(repo.findExerciseHistory).not.toHaveBeenCalled();
  });
});
