import type { QueryClient } from '@tanstack/react-query';

import { registerFoodLogMutationDefaults } from '@/features/nutrition';
import {
  registerActivitySessionMutationDefaults,
  registerStrengthSessionMutationDefaults,
} from '@/features/sessions';

// The writes that may be made offline and replayed later — after a restart, by key —
// register their mutationFn + onSuccess here, before the persisted cache (and its
// queued writes) is restored. Each is idempotent server-side (client-generated id),
// so a replay can't duplicate.
export function registerMutationDefaults(queryClient: QueryClient) {
  registerFoodLogMutationDefaults(queryClient);
  registerStrengthSessionMutationDefaults(queryClient);
  registerActivitySessionMutationDefaults(queryClient);
}
