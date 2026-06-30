import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../app';
import { AUTH_COOKIE_NAME } from '../../lib/auth-cookie';
import { signToken } from '../../lib/jwt';
import type { BodyMeasurementRow } from './body.repository';
import * as bodyRepository from './body.repository';

// Mock the Drizzle boundary so tests drive the real Hono app + service over fake
// rows.
vi.mock('./body.repository');
const repo = vi.mocked(bodyRepository);

const ENTRY_ID = '88888888-8888-4888-8888-888888888888';
const JSON_HEADERS = { 'content-type': 'application/json' };

function fakeMeasurement(overrides: Partial<BodyMeasurementRow> = {}): BodyMeasurementRow {
  return {
    id: ENTRY_ID,
    userId: 'user-1',
    measuredDate: '2026-06-30',
    weightKg: 82.4,
    bodyFatPct: 15.2,
    bicepsCm: null,
    chestCm: null,
    waistCm: null,
    hipCm: null,
    thighCm: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

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

describe('body measurement list route', () => {
  it('GET /api/body-measurements returns the history', async () => {
    repo.listBodyMeasurements.mockResolvedValue([fakeMeasurement()]);

    const res = await request('GET', '/api/body-measurements', { cookie: await authCookie() });
    const body = (await res.json()) as { data: BodyMeasurementRow[] };

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(repo.listBodyMeasurements).toHaveBeenCalledWith('user-1');
  });

  it('GET /api/body-measurements without auth returns 401', async () => {
    const res = await request('GET', '/api/body-measurements');

    expect(res.status).toBe(401);
    expect(repo.listBodyMeasurements).not.toHaveBeenCalled();
  });
});

describe('body measurement upsert route', () => {
  it('PUT /api/body-measurements forwards only the provided fields (merge)', async () => {
    repo.upsertBodyMeasurement.mockResolvedValue(fakeMeasurement());

    const res = await request('PUT', '/api/body-measurements', {
      cookie: await authCookie(),
      body: { measuredDate: '2026-06-30', weightKg: 82.4 },
    });

    expect(res.status).toBe(200);
    // Only weightKg is sent, so omitted fields stay out of the payload — that's
    // what keeps the quick-add weight form non-destructive on an existing day.
    expect(repo.upsertBodyMeasurement).toHaveBeenCalledWith({
      userId: 'user-1',
      measuredDate: '2026-06-30',
      weightKg: 82.4,
    });
  });

  it('PUT /api/body-measurements forwards an explicit null to clear a field', async () => {
    repo.upsertBodyMeasurement.mockResolvedValue(fakeMeasurement({ bodyFatPct: null }));

    const res = await request('PUT', '/api/body-measurements', {
      cookie: await authCookie(),
      body: { measuredDate: '2026-06-30', bodyFatPct: null },
    });

    expect(res.status).toBe(200);
    expect(repo.upsertBodyMeasurement).toHaveBeenCalledWith({
      userId: 'user-1',
      measuredDate: '2026-06-30',
      bodyFatPct: null,
    });
  });

  it('PUT /api/body-measurements with no measurements returns 400', async () => {
    const res = await request('PUT', '/api/body-measurements', {
      cookie: await authCookie(),
      body: { measuredDate: '2026-06-30' },
    });

    expect(res.status).toBe(400);
    expect(repo.upsertBodyMeasurement).not.toHaveBeenCalled();
  });

  it('PUT /api/body-measurements with body fat over 100 returns 400', async () => {
    const res = await request('PUT', '/api/body-measurements', {
      cookie: await authCookie(),
      body: { measuredDate: '2026-06-30', bodyFatPct: 150 },
    });

    expect(res.status).toBe(400);
    expect(repo.upsertBodyMeasurement).not.toHaveBeenCalled();
  });

  it('PUT /api/body-measurements with an invalid date returns 400', async () => {
    const res = await request('PUT', '/api/body-measurements', {
      cookie: await authCookie(),
      body: { measuredDate: '30-06-2026', weightKg: 82.4 },
    });

    expect(res.status).toBe(400);
    expect(repo.upsertBodyMeasurement).not.toHaveBeenCalled();
  });
});

describe('body measurement delete route', () => {
  it('DELETE /api/body-measurements/:id deletes and returns success', async () => {
    repo.deleteBodyMeasurement.mockResolvedValue(fakeMeasurement());

    const res = await request('DELETE', `/api/body-measurements/${ENTRY_ID}`, {
      cookie: await authCookie(),
    });
    const body = (await res.json()) as { data: { success: boolean } };

    expect(res.status).toBe(200);
    expect(body.data.success).toBe(true);
  });

  it('DELETE /api/body-measurements/:id returns 404 when not found', async () => {
    repo.deleteBodyMeasurement.mockResolvedValue(undefined);

    const res = await request('DELETE', `/api/body-measurements/${ENTRY_ID}`, {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(404);
  });

  it('DELETE /api/body-measurements/:id with a non-uuid id returns 404 without touching the repo', async () => {
    const res = await request('DELETE', '/api/body-measurements/not-a-uuid', {
      cookie: await authCookie(),
    });

    expect(res.status).toBe(404);
    expect(repo.deleteBodyMeasurement).not.toHaveBeenCalled();
  });
});
