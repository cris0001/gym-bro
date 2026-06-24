import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateTagInput } from '@gym-bro/shared';

import { updateTag } from '../api/tags';
import { tagKeys } from './use-tags';

// Updates a tag (rename/recolor), then invalidates the tag list.
export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTagInput }) => updateTag(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}
