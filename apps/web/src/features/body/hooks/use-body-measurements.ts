import { queryOptions, useQuery } from '@tanstack/react-query';

import type { BodyMeasurement } from '@gym-bro/shared';

import { listBodyMeasurements } from '../api/body';

// Query-key factory for body measurements. Upserting or deleting an entry
// invalidates bodyKeys.all so the list (and the charts derived from it) refresh.
export const bodyKeys = {
  all: ['body', 'measurements'] as const,
  list: () => [...bodyKeys.all, 'list'] as const,
};

export function bodyMeasurementsQueryOptions() {
  return queryOptions<BodyMeasurement[]>({
    queryKey: bodyKeys.list(),
    queryFn: listBodyMeasurements,
  });
}

export function useBodyMeasurements() {
  return useQuery(bodyMeasurementsQueryOptions());
}
