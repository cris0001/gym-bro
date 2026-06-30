import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteBodyMeasurement } from '../api/body';
import { bodyKeys } from './use-body-measurements';

export function useDeleteBodyMeasurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBodyMeasurement(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bodyKeys.all });
    },
  });
}
