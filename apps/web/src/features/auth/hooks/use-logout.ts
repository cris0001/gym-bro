import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearPersistedQueryCache } from '@/lib/query-persistence';

import { logout } from '../api/logout';

// Logs out, then wipes all cached server state — in memory AND the persisted
// offline snapshot on this device. In a single-user app the whole cache belongs to
// the session, so clearing it prevents the next user (or the same one after
// re-login) from seeing stale data.
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      void clearPersistedQueryCache();
    },
  });
}
