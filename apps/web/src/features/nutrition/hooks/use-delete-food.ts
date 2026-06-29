import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteFood } from '../api/foods';
import { foodKeys } from './use-foods';

export function useDeleteFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFood(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodKeys.all });
    },
  });
}
