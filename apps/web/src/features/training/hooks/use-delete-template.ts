import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTemplate } from '../api/templates';
import { planKeys } from './use-plans';

// Hard-deletes a template (cascades to its exercises), then invalidates plan
// queries so the plan detail and list refresh.
export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}
