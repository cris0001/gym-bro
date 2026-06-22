import { Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import {
  loginSchema,
  onboardingSchema,
  registerSchema,
  updateProfileSchema,
} from '@gym-bro/shared';

import { AUTH_COOKIE_NAME, authCookieOptions } from '../../lib/auth-cookie';
import { parseJson } from '../../lib/validate';
import { requireAuth, type AppEnv } from '../../middleware/auth';
import * as authService from './auth.service';

// Thin handlers: validate, delegate to the service, format the response. The
// cookie (an HTTP concern) is set/cleared here, not in the service.
export const authRoutes = new Hono<AppEnv>();

authRoutes.post('/register', async (c) => {
  const { email, password } = await parseJson(c, registerSchema);
  const { user, token } = await authService.register(email, password);
  setCookie(c, AUTH_COOKIE_NAME, token, authCookieOptions());
  return c.json({ data: user }, 201);
});

authRoutes.post('/login', async (c) => {
  const { email, password } = await parseJson(c, loginSchema);
  const { user, token } = await authService.login(email, password);
  setCookie(c, AUTH_COOKIE_NAME, token, authCookieOptions());
  return c.json({ data: user });
});

authRoutes.post('/logout', (c) => {
  deleteCookie(c, AUTH_COOKIE_NAME, { path: '/' });
  return c.json({ data: { success: true } });
});

authRoutes.get('/me', requireAuth, async (c) => {
  const user = await authService.getProfile(c.get('userId'));
  return c.json({ data: user });
});

authRoutes.patch('/me', requireAuth, async (c) => {
  const data = await parseJson(c, updateProfileSchema);
  const user = await authService.updateProfile(c.get('userId'), data);
  return c.json({ data: user });
});

authRoutes.post('/onboarding', requireAuth, async (c) => {
  const data = await parseJson(c, onboardingSchema);
  const user = await authService.completeOnboarding(c.get('userId'), data);
  return c.json({ data: user });
});
