import type { CookieOptions } from 'hono/utils/cookie';

import { env } from './env';

export const AUTH_COOKIE_NAME = 'auth_token';

// 7 days in seconds — matches the JWT expiry so the cookie and token lapse
// together.
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

// Shared options for the auth cookie. HttpOnly keeps the token out of JS (XSS
// can't read it); SameSite=Lax is reasonable CSRF defense; Secure only in
// production so plain http://localhost works in dev.
export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'Lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}
