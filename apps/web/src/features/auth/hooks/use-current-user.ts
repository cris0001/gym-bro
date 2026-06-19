import { queryOptions, useQuery } from '@tanstack/react-query';

import { ApiError } from '@/lib/api-client';

import { getMe } from '../api/me';
import type { User } from '../types';

export const CURRENT_USER_KEY = ['auth', 'me'] as const;

// Shared by useCurrentUser and the route guard's beforeLoad so both hit one
// cache entry. A 401 means "not logged in", so it isn't retried.
export const meQueryOptions = queryOptions<User, ApiError>({
  queryKey: CURRENT_USER_KEY,
  queryFn: getMe,
  retry: (failureCount, error) =>
    error instanceof ApiError && error.status === 401 ? false : failureCount < 1,
});

export function useCurrentUser() {
  return useQuery(meQueryOptions);
}
