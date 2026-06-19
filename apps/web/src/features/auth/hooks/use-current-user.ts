import { useQuery } from '@tanstack/react-query';

import { ApiError } from '@/lib/api-client';

import { getMe } from '../api/me';
import type { User } from '../types';

// Shared cache key for the current user. Mutations (login/register/logout)
// target this key so the whole tree reacts to auth changes.
export const CURRENT_USER_KEY = ['auth', 'me'] as const;

// Bootstraps the session from the HttpOnly cookie. A 401 is the normal
// "not logged in" state, so it isn't retried; consumers read `error` (an
// ApiError with status 401) to know the user is signed out.
export function useCurrentUser() {
  return useQuery<User, ApiError>({
    queryKey: CURRENT_USER_KEY,
    queryFn: getMe,
    retry: (failureCount, error) =>
      error instanceof ApiError && error.status === 401 ? false : failureCount < 1,
  });
}
