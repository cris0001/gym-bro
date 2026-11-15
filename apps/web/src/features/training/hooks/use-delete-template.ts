import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTemplate } from '../api/templates';
import { planKeys } from './use-plans';
import { templateKeys } from './use-template';

// Hard-deletes a template (cascades to its exercises), then invalidates plan
// queries so the plan detail and list refresh.
export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
      void queryClient.invalidateQueries({ queryKey: templateKeys.all });
      // Sessions feature's root key — planned sessions and workouts show the template name / short name.
      void queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
