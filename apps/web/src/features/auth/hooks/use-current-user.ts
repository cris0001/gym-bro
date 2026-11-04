import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-client';

import { getMe } from '../api/me';
import type { User } from '../types';

export const CURRENT_USER_KEY = ['auth', 'me'] as const;

// Shared by useCurrentUser and the route guard's beforeLoad so both hit one
// cache entry. A 401 means "not logged in" — the global retry policy never retries
// a 4xx, so no override is needed here.
export const meQueryOptions = queryOptions<User, ApiError>({
  queryKey: CURRENT_USER_KEY,
  queryFn: getMe,
});

export function useCurrentUser() {
  return useQuery(meQueryOptions);
}
