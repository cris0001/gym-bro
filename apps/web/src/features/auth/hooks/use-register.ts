import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearPersistedQueryCache } from '@/lib/query-persistence';

import { register } from '../api/register';
import type { RegisterInput, User } from '../types';
import { CURRENT_USER_KEY } from './use-current-user';

// Registers, then seeds the current-user cache from the response so the new
// account is signed in immediately (mirrors useLogin — the API sets the cookie
// on register too).
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (user) => {
      // A lapsed session redirects without logging out, so the cache (and its
      // on-device snapshot) may still hold another account's data — start clean.
      queryClient.getQueryCache().clear();
      void clearPersistedQueryCache();
      queryClient.setQueryData<User>(CURRENT_USER_KEY, user);
    },
  });
}
