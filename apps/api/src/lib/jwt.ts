import { jwtVerify, SignJWT } from 'jose';

import { env } from './env';
import { UnauthorizedError } from './errors';

// Symmetric signing (single shared secret) — matches our JWT_SECRET. jose wants
// the secret as bytes.
const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRY = '7d';
const secret = new TextEncoder().encode(env.JWT_SECRET);

// Sign a token whose subject is the user id. Minimal claims: jose adds iat/exp;
// everything else (email, etc.) is fetched fresh server-side.
export function signToken(userId: string): Promise<string> {
  return new SignJWT()
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(secret);
}

// Verify a token and return its subject. Any failure (expired, malformed, bad
// signature) becomes a 401 via UnauthorizedError, never a 500.
export async function verifyToken(token: string): Promise<{ sub: string }> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [JWT_ALGORITHM],
    });
    if (typeof payload.sub !== 'string') {
      throw new UnauthorizedError('Invalid token');
    }
    return { sub: payload.sub };
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError('Invalid or expired token');
  }
}
