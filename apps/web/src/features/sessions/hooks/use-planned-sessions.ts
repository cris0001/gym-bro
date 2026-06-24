import { queryOptions, useQuery } from '@tanstack/react-query';

import type { PlannedSessionWithTemplate } from '@gym-bro/shared';

import { listPlannedSessions } from '../api/planned-sessions';

// Query-key factory for planned sessions. Each date window caches under its own
// key; mutations invalidate `plannedSessionKeys.all` to refresh every window.
export const plannedSessionKeys = {
  all: ['sessions', 'planned'] as const,
  range: (from: string, to: string) => [...plannedSessionKeys.all, from, to] as const,
};

export function plannedSessionsQueryOptions(from: string, to: string) {
  return queryOptions<PlannedSessionWithTemplate[]>({
    queryKey: plannedSessionKeys.range(from, to),
    queryFn: () => listPlannedSessions(from, to),
  });
}

export function usePlannedSessions(from: string, to: string) {
  return useQuery(plannedSessionsQueryOptions(from, to));
}
