import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { QueryClient } from '@tanstack/react-query';
import {
  persistQueryClientRestore,
  persistQueryClientSubscribe,
} from '@tanstack/react-query-persist-client';

import { idbStorage } from '@/lib/idb-storage';

// How long a persisted snapshot stays usable. Matches the QueryClient's gcTime so an
// inactive query isn't garbage-collected (and dropped from the snapshot) sooner.
export const PERSIST_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Bump when a change to cached response shapes would make an old snapshot unsafe to
// render. Deliberately NOT the build id: a new deploy would then wipe the snapshot —
// and with it any writes still queued from offline use.
const CACHE_BUSTER = 'v1';

const persister = createAsyncStoragePersister({
  storage: idbStorage,
  key: 'gym-bro-query-cache',
  throttleTime: 1000,
});

const persistOptions = {
  persister,
  maxAge: PERSIST_MAX_AGE_MS,
  buster: CACHE_BUSTER,
};

// Offline support: the query cache (last-seen data) and every PAUSED mutation (a
// write made without a connection) are mirrored to IndexedDB. On startup we restore
// that snapshot BEFORE the app renders — the router's auth check reads the cached
// user, so an offline cold start opens the app instead of bouncing to the landing —
// then resume the queued writes. Their mutationFns come from setMutationDefaults
// (registered before this runs), since the components that queued them are gone.
export async function restoreQueryCache(queryClient: QueryClient): Promise<void> {
  try {
    await persistQueryClientRestore({ queryClient, ...persistOptions });
  } catch {
    // A corrupt or unreadable snapshot just means starting cold.
  }
  persistQueryClientSubscribe({ queryClient, ...persistOptions });
  void queryClient.resumePausedMutations();
}

// Logout: drop the on-disk copy too, so the next person on this device never sees
// the previous account's cached data (the in-memory cache is cleared separately).
export async function clearPersistedQueryCache(): Promise<void> {
  await persister.removeClient();
}
