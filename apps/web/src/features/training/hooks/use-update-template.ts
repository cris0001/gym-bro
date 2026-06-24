import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateTemplateInput } from '@gym-bro/shared';

import { updateTemplate } from '../api/templates';
import { planKeys } from './use-plans';

// Updates a template (rename/re-describe), then invalidates plan queries so the
// plan detail reflects the change.
export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTemplateInput }) =>
      updateTemplate(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}
