import { apiFetch } from '@/lib/api-client';

import type { UpdateProfileInput, User } from '../types';

// PATCH /api/auth/me — partial profile update: a value sets, null clears, an absent
// field is left as is.
export function updateProfile(input: UpdateProfileInput): Promise<User> {
  return apiFetch<User>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(input) });
}
