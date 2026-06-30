import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpsertBodyMeasurementInput } from '@gym-bro/shared';

import { upsertBodyMeasurement } from '../api/body';
import { bodyKeys } from './use-body-measurements';

export function useUpsertBodyMeasurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertBodyMeasurementInput) => upsertBodyMeasurement(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bodyKeys.all });
    },
  });
}
