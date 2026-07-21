import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../app';
import { AUTH_COOKIE_NAME } from '../../lib/auth-cookie';
import { signToken } from '../../lib/jwt';
import type { StravaConnectionRow } from './strava.repository';
import * as stravaRepository from './strava.repository';

// Mock the Drizzle boundary so tests drive the real Hono app + service (incl. the
// OAuth state signing/verification and token-exchange fetch) over fake rows.
vi.mock('./strava.repository');
const repo = vi.mocked(stravaRepository);

const CORS_ORIGIN = 'http://localhost:5173';

function fakeConnection(overrides: Partial<StravaConnectionRow> = {}): StravaConnectionRow {
  return {
    id: 'conn-1',
    userId: 'user-1',
    athleteId: '12345',
    accessToken: 'access-x',
    refreshToken: 'refresh-x',
    expiresAt: new Date('2099-01-01T00:00:00Z'),
    scope: 'activity:read_all',
    lastSyncAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

async function authCookie(userId = 'user-1'): Promise<string> {
  return `${AUTH_COOKIE_NAME}=${await signToken(userId)}`;
}

function request(method: string, path: string, cookie?: string) {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;
  return app.request(path, { method, headers });
}

// Drive /connect and pull the signed `state` out of the Strava authorize URL, so the
// callback tests use a real, valid state without re-implementing the signing.
async function issuedState(): Promise<string> {
  const res = await request('GET', '/api/strava/connect', await authCookie());
  const url = new URL(res.headers.get('location') ?? '');
  return url.searchParams.get('state') ?? '';
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('strava connect route', () => {
  it('GET /api/strava/connect redirects to the Strava authorize URL with a state', async () => {
    const res = await request('GET', '/api/strava/connect', await authCookie());

    expect(res.status).toBe(302);
    const location = res.headers.get('location') ?? '';
    expect(location.startsWith('https://www.strava.com/oauth/authorize')).toBe(true);
    const url = new URL(location);
    expect(url.searchParams.get('client_id')).toBe('test-client-id');
    expect(url.searchParams.get('scope')).toBe('activity:read_all');
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/strava/callback');
    expect(url.searchParams.get('state')).toBeTruthy();
  });

  it('GET /api/strava/connect without auth returns 401', async () => {
    const res = await request('GET', '/api/strava/connect');
    expect(res.status).toBe(401);
  });
});

describe('strava callback route', () => {
  it('exchanges the code and stores the connection, then redirects to the app', async () => {
    const state = await issuedState();
    repo.upsertConnection.mockResolvedValue(fakeConnection());
    // Strava token endpoint response (expires_at is unix seconds).
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          expires_at: 4102444800,
          athlete: { id: 12345 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const res = await request(
      'GET',
      `/api/strava/callback?code=abc&state=${encodeURIComponent(state)}&scope=activity:read_all`,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(`${CORS_ORIGIN}/strava?connected=1`);
    expect(repo.upsertConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        athleteId: '12345',
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        scope: 'activity:read_all',
      }),
    );
  });

  it('redirects to the app with an error when the user denies access', async () => {
    const res = await request('GET', '/api/strava/callback?error=access_denied&state=whatever');

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(`${CORS_ORIGIN}/strava?error=1`);
    expect(repo.upsertConnection).not.toHaveBeenCalled();
  });

  it('redirects to the app with an error when the state is invalid', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const res = await request('GET', '/api/strava/callback?code=abc&state=not-a-valid-state');

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(`${CORS_ORIGIN}/strava?error=1`);
    // Bad state is rejected before any token exchange.
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(repo.upsertConnection).not.toHaveBeenCalled();
  });
});

describe('strava status + disconnect routes', () => {
  it('GET /api/strava/status returns connected details when linked', async () => {
    repo.findConnectionByUserId.mockResolvedValue(
      fakeConnection({ lastSyncAt: new Date('2026-07-01T00:00:00Z') }),
    );

    const res = await request('GET', '/api/strava/status', await authCookie());
    const body = (await res.json()) as {
      data: { connected: boolean; athleteId: string | null; lastSyncAt: string | null };
    };

    expect(res.status).toBe(200);
    expect(body.data).toEqual({
      connected: true,
      athleteId: '12345',
      scope: 'activity:read_all',
      lastSyncAt: '2026-07-01T00:00:00.000Z',
    });
  });

  it('GET /api/strava/status returns not-connected when unlinked', async () => {
    repo.findConnectionByUserId.mockResolvedValue(undefined);

    const res = await request('GET', '/api/strava/status', await authCookie());
    const body = (await res.json()) as { data: { connected: boolean } };

    expect(res.status).toBe(200);
    expect(body.data.connected).toBe(false);
  });

  it('GET /api/strava/status without auth returns 401', async () => {
    const res = await request('GET', '/api/strava/status');
    expect(res.status).toBe(401);
  });

  it('DELETE /api/strava/connect disconnects and returns success', async () => {
    repo.deleteConnection.mockResolvedValue(fakeConnection());

    const res = await request('DELETE', '/api/strava/connect', await authCookie());
    const body = (await res.json()) as { data: { success: boolean } };

    expect(res.status).toBe(200);
    expect(body.data.success).toBe(true);
    expect(repo.deleteConnection).toHaveBeenCalledWith('user-1');
  });
});
