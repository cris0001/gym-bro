import { apiFetch } from '@/lib/api-client';

import type { UpdateProfileInput, User } from '../types';

// POST /api/auth/onboarding — applies any provided profile fields and stamps
// onboardedAt. An empty body is the "skip" path (just stamps the flag).
export function completeOnboarding(input: UpdateProfileInput): Promise<User> {
  return apiFetch<User>('/api/auth/onboarding', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
