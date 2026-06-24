import { queryOptions, useQuery } from '@tanstack/react-query';

import type { WorkoutTag } from '@gym-bro/shared';

import { listTags } from '../api/tags';

// Query-key factory for tags. There's no filtering, so a single list lives
// under `tagKeys.all`; mutations invalidate that one key.
export const tagKeys = {
  all: ['training', 'tags'] as const,
};

export function tagsQueryOptions() {
  return queryOptions<WorkoutTag[]>({
    queryKey: tagKeys.all,
    queryFn: listTags,
  });
}

export function useTags() {
  return useQuery(tagsQueryOptions());
}
