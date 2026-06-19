import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '../../db/schema/users';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../lib/errors';
import { hashPassword } from '../../lib/password';
import * as authRepository from './auth.repository';
import { getProfile, login, register, updateProfile } from './auth.service';

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
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('register', () => {
  it('creates a user (lowercased email, hashed password) and returns a token', async () => {
    repo.findByEmail.mockResolvedValue(undefined);
    repo.create.mockImplementation((data) =>
      Promise.resolve(fakeUser({ email: data.email, passwordHash: data.passwordHash })),
    );

    const { user, token } = await register('TEST@Example.com', 'password123');

    expect(repo.findByEmail).toHaveBeenCalledWith('test@example.com');
    const createArg = repo.create.mock.calls[0]?.[0];
    expect(createArg?.email).toBe('test@example.com');
    expect(createArg?.passwordHash).not.toBe('password123');
    expect(token.split('.')).toHaveLength(3);
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('rejects a duplicate email with ConflictError', async () => {
    repo.findByEmail.mockResolvedValue(fakeUser());

    await expect(register('test@example.com', 'password123')).rejects.toBeInstanceOf(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
  });
});

describe('login', () => {
  it('returns a sanitized user and token for valid credentials', async () => {
    const passwordHash = await hashPassword('password123');
    repo.findByEmail.mockResolvedValue(fakeUser({ passwordHash }));

    const { user, token } = await login('test@example.com', 'password123');

    expect(token.split('.')).toHaveLength(3);
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('rejects a wrong password with UnauthorizedError', async () => {
    const passwordHash = await hashPassword('password123');
    repo.findByEmail.mockResolvedValue(fakeUser({ passwordHash }));

    await expect(login('test@example.com', 'wrong-password')).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('rejects an unknown email with UnauthorizedError', async () => {
    repo.findByEmail.mockResolvedValue(undefined);

    await expect(login('nobody@example.com', 'password123')).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });
});

describe('getProfile', () => {
  it('returns the sanitized user when found', async () => {
    repo.findById.mockResolvedValue(fakeUser());

    const user = await getProfile('user-1');

    expect(user.id).toBe('user-1');
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('throws NotFoundError when the user is gone', async () => {
    repo.findById.mockResolvedValue(undefined);

    await expect(getProfile('missing')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('updateProfile', () => {
  it('returns the updated, sanitized user', async () => {
    repo.updateProfile.mockResolvedValue(fakeUser({ sex: 'male', heightCm: 180 }));

    const user = await updateProfile('user-1', { sex: 'male', heightCm: 180 });

    expect(user.sex).toBe('male');
    expect(user.heightCm).toBe(180);
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('throws NotFoundError when the user is gone', async () => {
    repo.updateProfile.mockResolvedValue(undefined);

    await expect(updateProfile('missing', { heightCm: 180 })).rejects.toBeInstanceOf(NotFoundError);
  });
});
