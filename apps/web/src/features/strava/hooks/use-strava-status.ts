import { queryOptions, useQuery } from '@tanstack/react-query';

import type { StravaConnectionStatus } from '@gym-bro/shared';

import { getStravaStatus } from '../api/strava';

// Query-key factory for the Strava feature. Mutations (import, disconnect) invalidate
// `stravaKeys.all` to refresh both the status and the activity list.
export const stravaKeys = {
  all: ['strava'] as const,
  status: () => [...stravaKeys.all, 'status'] as const,
  sessions: (from?: string, to?: string) =>
    [...stravaKeys.all, 'sessions', from ?? null, to ?? null] as const,
};

export function stravaStatusQueryOptions() {
  return queryOptions<StravaConnectionStatus>({
    queryKey: stravaKeys.status(),
    queryFn: getStravaStatus,
  });
}

export function useStravaStatus() {
  return useQuery(stravaStatusQueryOptions());
}
