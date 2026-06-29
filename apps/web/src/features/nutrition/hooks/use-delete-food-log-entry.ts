import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteFoodLogEntry } from '../api/food-log';
import { foodLogKeys } from './use-daily-food-log';

export function useDeleteFoodLogEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFoodLogEntry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: foodLogKeys.all });
    },
  });
}
