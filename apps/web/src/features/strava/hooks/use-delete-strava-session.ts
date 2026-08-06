import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { deleteStravaSession } from '../api/strava';
import { stravaKeys } from './use-strava-status';

// Remove one imported activity locally, then refresh the activity lists.
export function useDeleteStravaSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStravaSession(id),
    onSuccess: () => {
      toast.success('Activity removed');
      void queryClient.invalidateQueries({ queryKey: stravaKeys.all });
    },
  });
}
