import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTag } from '../api/tags';
import { tagKeys } from './use-tags';

// Soft-deletes a tag, then invalidates the tag list so it disappears.
export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}
