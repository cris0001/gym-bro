import { apiFetch } from '@/lib/api-client';

import type { UpdateProfileInput, User } from '../types';

// GET /api/auth/me — the current user, or throws ApiError(401) when no valid
// auth cookie is present. Used to bootstrap the session on app load.
export function getMe(): Promise<User> {
  return apiFetch<User>('/api/auth/me');
}

// PATCH /api/auth/me — partial profile update (onboarding and settings).
export function updateProfile(input: UpdateProfileInput): Promise<User> {
  return apiFetch<User>('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
