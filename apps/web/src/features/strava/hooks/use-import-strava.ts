import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { importStravaActivities } from '../api/strava';
import { stravaKeys } from './use-strava-status';

// Import recent activities from Strava, then refresh the status + activity lists.
export function useImportStrava() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importStravaActivities,
    onSuccess: (result) => {
      toast.success(
        `Imported ${result.imported} ${result.imported === 1 ? 'activity' : 'activities'}`,
      );
      void queryClient.invalidateQueries({ queryKey: stravaKeys.all });
    },
  });
}
