import { queryOptions, useQuery } from '@tanstack/react-query';

import type { TemplateWithExercises } from '@gym-bro/shared';

import { getTemplate } from '../api/templates';

// Query-key factory for template details. Template-exercise mutations invalidate
// `templateKeys.detail(id)` to refresh the builder.
export const templateKeys = {
  all: ['training', 'templates'] as const,
  detail: (id: string) => [...templateKeys.all, 'detail', id] as const,
};

export function templateQueryOptions(id: string) {
  return queryOptions<TemplateWithExercises>({
    queryKey: templateKeys.detail(id),
    queryFn: () => getTemplate(id),
  });
}

export function useTemplate(id: string) {
  return useQuery(templateQueryOptions(id));
}
