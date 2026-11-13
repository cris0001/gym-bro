import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProfile } from '../api/update-profile';
import type { UpdateProfileInput, User } from '../types';
import { CURRENT_USER_KEY } from './use-current-user';

// Saves profile edits from Settings, writing the returned user straight into the me
// cache so everything reading it (e.g. the catalog's food-name language) updates at once.
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user) => {
      queryClient.setQueryData<User>(CURRENT_USER_KEY, user);
    },
  });
}
