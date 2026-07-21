import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { disconnectStrava } from '../api/strava';
import { stravaKeys } from './use-strava-status';

// Disconnect Strava, then refresh status (+ clear the activity lists on refetch).
export function useDisconnectStrava() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectStrava,
    onSuccess: () => {
      toast.success('Strava disconnected');
      void queryClient.invalidateQueries({ queryKey: stravaKeys.all });
    },
  });
}
