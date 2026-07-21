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

// Strava data only changes on a manual import/disconnect (which invalidate these
// keys), so a long staleTime avoids needless refetches of our own DB while browsing.
const STRAVA_STALE_MS = 10 * 60_000;

export function stravaStatusQueryOptions() {
  return queryOptions<StravaConnectionStatus>({
    queryKey: stravaKeys.status(),
    queryFn: getStravaStatus,
    staleTime: STRAVA_STALE_MS,
  });
}

export function useStravaStatus() {
  return useQuery(stravaStatusQueryOptions());
}
