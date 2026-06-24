import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../app';
import type { PlannedSession } from '../../db/schema/planned-sessions';
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
    const row: PlannedSessionWithTemplateRow = { ...fakePlanned(), templateName: 'Push' };
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
