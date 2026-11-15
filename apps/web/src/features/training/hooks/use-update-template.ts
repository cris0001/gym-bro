import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateTemplateInput } from '@gym-bro/shared';

import { updateTemplate } from '../api/templates';
import { planKeys } from './use-plans';
import { templateKeys } from './use-template';

// Updates a template (rename/re-describe), then invalidates plan queries so the
// plan detail reflects the change.
export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTemplateInput }) =>
      updateTemplate(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
      void queryClient.invalidateQueries({ queryKey: templateKeys.all });
      // Sessions feature's root key — planned sessions and workouts show the template name / short name.
      void queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
