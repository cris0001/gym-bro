import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateTemplateInput } from '@gym-bro/shared';

import { createTemplate } from '../api/templates';
import { planKeys } from './use-plans';

// Creates a template in a plan, then invalidates plan queries so the plan
// detail (its templates) and the list (its template count) both refresh.
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: CreateTemplateInput }) =>
      createTemplate(planId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}
