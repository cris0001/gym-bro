import { useMutation, useQueryClient } from '@tanstack/react-query';

import { completeOnboarding } from '../api/onboarding';
import type { UpdateProfileInput, User } from '../types';
import { CURRENT_USER_KEY } from './use-current-user';

// Completes onboarding, then writes the returned user into the me cache so the
// now-set onboardedAt immediately closes the sheet without a refetch.
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => completeOnboarding(input),
    onSuccess: (user) => {
      queryClient.setQueryData<User>(CURRENT_USER_KEY, user);
    },
  });
}
