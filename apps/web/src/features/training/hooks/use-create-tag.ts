import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateTagInput } from '@gym-bro/shared';

import { createTag } from '../api/tags';
import { tagKeys } from './use-tags';

// Creates a tag, then invalidates the tag list so the new row appears.
export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTagInput) => createTag(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}
