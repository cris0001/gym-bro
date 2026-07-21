import { queryOptions, useQuery } from '@tanstack/react-query';

import type { StravaSessionItem } from '@gym-bro/shared';

import { listStravaSessions } from '../api/strava';
import { stravaKeys } from './use-strava-status';

export function stravaSessionsQueryOptions(from?: string, to?: string) {
  return queryOptions<StravaSessionItem[]>({
    queryKey: stravaKeys.sessions(from, to),
    queryFn: () => listStravaSessions(from, to),
    // Imported data changes only on a manual import (which invalidates the key), so
    // it can stay fresh a while — the calendar/page read our DB, never Strava.
    staleTime: 10 * 60_000,
  });
}

// Imported activities. No range = all (the Strava page); a from/to = a window (the
// calendar's month).
export function useStravaSessions(from?: string, to?: string) {
  return useQuery(stravaSessionsQueryOptions(from, to));
}
