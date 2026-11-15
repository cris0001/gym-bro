import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearPersistedQueryCache } from '@/lib/query-persistence';

import { login } from '../api/login';
import type { LoginInput, User } from '../types';
import { CURRENT_USER_KEY } from './use-current-user';

// Logs in, then seeds the current-user cache from the response so guarded
// routes see the user immediately — no follow-up GET /me needed.
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (user) => {
      // A lapsed session redirects without logging out, so the cache (and its
      // on-device snapshot) may still hold another account's data — start clean.
      queryClient.getQueryCache().clear();
      void clearPersistedQueryCache();
      queryClient.setQueryData<User>(CURRENT_USER_KEY, user);
    },
  });
}
