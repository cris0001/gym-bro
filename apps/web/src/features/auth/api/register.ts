import { apiFetch } from '@/lib/api-client';

import type { RegisterInput, User } from '../types';

// POST /api/auth/register — creates the account and sets the auth cookie. The
// cookie is HttpOnly, so we never touch the token here; the browser stores it
// and apiFetch sends it on subsequent requests via credentials: 'include'.
export function register(input: RegisterInput): Promise<User> {
  return apiFetch<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
