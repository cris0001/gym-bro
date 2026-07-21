import { queryOptions, useQuery } from '@tanstack/react-query';

import type { StravaSessionItem } from '@gym-bro/shared';

import { listStravaSessions } from '../api/strava';
import { stravaKeys } from './use-strava-status';

export function stravaSessionsQueryOptions(from?: string, to?: string) {
  return queryOptions<StravaSessionItem[]>({
    queryKey: stravaKeys.sessions(from, to),
    queryFn: () => listStravaSessions(from, to),
  });
}

// Imported activities. No range = all (the Strava page); a from/to = a window (the
// calendar's month).
export function useStravaSessions(from?: string, to?: string) {
  return useQuery(stravaSessionsQueryOptions(from, to));
}
