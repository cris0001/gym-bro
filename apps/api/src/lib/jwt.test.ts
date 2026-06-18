import { SignJWT } from 'jose';
import { describe, expect, it } from 'vitest';

import { env } from './env';
import { UnauthorizedError } from './errors';
import { signToken, verifyToken } from './jwt';

describe('jwt', () => {
  it('signs a token and verifies its subject', async () => {
    const token = await signToken('user-123');

    expect(token.split('.')).toHaveLength(3);
    await expect(verifyToken(token)).resolves.toEqual({ sub: 'user-123' });
  });

  it('rejects a malformed token with UnauthorizedError', async () => {
    await expect(verifyToken('not.a.jwt')).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects a token signed with a different secret', async () => {
    const otherSecret = new TextEncoder().encode('a-totally-different-secret-32-chars-min-xxxxx');
    const forged = await new SignJWT()
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user-x')
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(otherSecret);

    await expect(verifyToken(forged)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects an expired token', async () => {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const expired = await new SignJWT()
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user-x')
      // Epoch second 1 (1970) — comfortably in the past.
      .setExpirationTime(1)
      .sign(secret);

    await expect(verifyToken(expired)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
