import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../app';
import type { User } from '../../db/schema/users';
import { hashPassword } from '../../lib/password';
import * as authRepository from './auth.repository';

vi.mock('./auth.repository');
const repo = vi.mocked(authRepository);

function fakeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'placeholder-hash',
    birthdate: null,
    sex: null,
    heightCm: null,
    onboardedAt: null,
    activePlanId: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

const JSON_HEADERS = { 'content-type': 'application/json' };

function post(path: string, body: unknown, cookie?: string) {
  return app.request(path, {
    method: 'POST',
    headers: cookie ? { ...JSON_HEADERS, cookie } : JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

function cookieFrom(res: Response): string {
  return (res.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('auth routes', () => {
  it('POST /register returns 201, sets the cookie, and omits passwordHash', async () => {
    repo.findByEmail.mockResolvedValue(undefined);
    repo.create.mockResolvedValue(fakeUser());

    const res = await post('/api/auth/register', {
      email: 'test@example.com',
      password: 'password123',
    });
    const body = (await res.json()) as { data: { email: string } };

    expect(res.status).toBe(201);
    expect(cookieFrom(res).startsWith('auth_token=')).toBe(true);
    expect(body.data.email).toBe('test@example.com');
    expect(body.data).not.toHaveProperty('passwordHash');
  });

  it('POST /register on a taken email returns 409', async () => {
    repo.findByEmail.mockResolvedValue(fakeUser());

    const res = await post('/api/auth/register', {
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
  });

  it('POST /register with invalid body returns 400 with field details', async () => {
    const res = await post('/api/auth/register', { email: 'bad', password: 'x' });
    const body = (await res.json()) as {
      error: { code: string; details?: Record<string, string[]> };
    };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toHaveProperty('email');
    expect(body.error.details).toHaveProperty('password');
  });

  it('GET /me without a cookie returns 401', async () => {
    const res = await app.request('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('register then GET /me with the cookie returns the current user', async () => {
    repo.findByEmail.mockResolvedValue(undefined);
    repo.create.mockResolvedValue(fakeUser());
    const reg = await post('/api/auth/register', {
      email: 'test@example.com',
      password: 'password123',
    });
    const cookie = cookieFrom(reg);

    repo.findById.mockResolvedValue(fakeUser());
    const res = await app.request('/api/auth/me', { headers: { cookie } });
    const body = (await res.json()) as { data: { id: string } };

    expect(res.status).toBe(200);
    expect(body.data.id).toBe('user-1');
    expect(repo.findById).toHaveBeenCalledWith('user-1');
  });

  it('POST /login with valid credentials returns 200 and a cookie', async () => {
    repo.findByEmail.mockResolvedValue(
      fakeUser({ passwordHash: await hashPassword('password123') }),
    );

    const res = await post('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(cookieFrom(res).startsWith('auth_token=')).toBe(true);
  });

  it('POST /login with a wrong password returns 401', async () => {
    repo.findByEmail.mockResolvedValue(
      fakeUser({ passwordHash: await hashPassword('password123') }),
    );

    const res = await post('/api/auth/login', {
      email: 'test@example.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
  });

  it('POST /logout returns 200 and clears the cookie', async () => {
    const res = await app.request('/api/auth/logout', { method: 'POST' });

    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('auth_token=');
  });

  it('POST /onboarding without a cookie returns 401', async () => {
    const res = await post('/api/auth/onboarding', { heightCm: 180 });

    expect(res.status).toBe(401);
  });

  it('register then POST /onboarding stamps onboardedAt and applies fields', async () => {
    repo.findByEmail.mockResolvedValue(undefined);
    repo.create.mockResolvedValue(fakeUser());
    const reg = await post('/api/auth/register', {
      email: 'test@example.com',
      password: 'password123',
    });
    const cookie = cookieFrom(reg);

    repo.completeOnboarding.mockResolvedValue(
      fakeUser({ heightCm: 180, onboardedAt: new Date('2026-06-19T00:00:00Z') }),
    );
    const res = await post('/api/auth/onboarding', { heightCm: 180 }, cookie);
    const body = (await res.json()) as { data: { heightCm: number; onboardedAt: string | null } };

    expect(res.status).toBe(200);
    expect(repo.completeOnboarding).toHaveBeenCalledWith('user-1', { heightCm: 180 });
    expect(body.data.heightCm).toBe(180);
    expect(body.data.onboardedAt).not.toBeNull();
  });
});
