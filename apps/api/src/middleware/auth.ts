import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';

import { AUTH_COOKIE_NAME } from '../lib/auth-cookie';
import { UnauthorizedError } from '../lib/errors';
import { verifyToken } from '../lib/jwt';

// Context variables set by requireAuth, so protected handlers can read the
// authenticated user id type-safely via c.get('userId').
export interface AppEnv {
  Variables: { userId: string };
}

// Gate for protected routes: requires a valid JWT in the auth cookie. Missing
// or invalid tokens become a 401 (verifyToken already throws UnauthorizedError).
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = getCookie(c, AUTH_COOKIE_NAME);
  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }
  const { sub } = await verifyToken(token);
  c.set('userId', sub);
  await next();
};
