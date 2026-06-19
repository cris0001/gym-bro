import { apiFetch } from '@/lib/api-client';

import type { LoginInput, User } from '../types';

// POST /api/auth/login — verifies credentials and sets the auth cookie.
export function login(input: LoginInput): Promise<User> {
  return apiFetch<User>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
