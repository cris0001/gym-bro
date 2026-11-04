import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApiError } from '@/lib/api-client';

// Retry budget: a few attempts for transient failures, then give up and show the
// error (queries: the page's ErrorState with "Try again"; mutations: a toast).
const MAX_QUERY_RETRIES = 3;
const MAX_MUTATION_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 8_000;
const MAX_RETRY_AFTER_MS = 30_000;

// Retry only what apiFetch marked retryable: a network drop, timeout, 5xx or 429 on
// a request that is safe to repeat. Never a 4xx (validation, 404, 409, 401) — the
// same request would fail the same way — and never a non-idempotent POST, which
// could double-write if its first attempt actually reached the server.
function isRetryable(error: unknown): boolean {
  return error instanceof ApiError && error.retryable;
}

// Exponential backoff with "equal jitter": 1s, 2s, 4s… capped at 8s, each randomised
// within its upper half so clients recovering from the same outage don't retry in
// lockstep. A server's Retry-After (429/503) wins over the curve.
function retryDelay(failureCount: number, error: unknown): number {
  if (error instanceof ApiError && error.retryAfterSeconds !== undefined) {
    return Math.min(error.retryAfterSeconds * 1000, MAX_RETRY_AFTER_MS);
  }
  const ceiling = Math.min(1000 * 2 ** failureCount, MAX_RETRY_DELAY_MS);
  return ceiling / 2 + Math.random() * (ceiling / 2);
}

// Single shared QueryClient. Defaults tuned for a personal app:
// - staleTime 60s: data stays fresh briefly, avoiding refetch storms on navigation.
// - retry: the bounded, transient-only policy above (queries and mutations). With the
//   default networkMode 'online', requests and pending retries pause while the device
//   is offline and resume when it reconnects instead of burning the retry budget.
// - refetchOnWindowFocus off: no surprise refetches when tabbing back at the gym.
//
// A MutationCache onError surfaces EVERY failed mutation (after its retries) as an
// error toast, so no write silently fails. A mutation can opt out with
// `meta: { skipErrorToast: true }` (e.g. when it renders its own inline error), and
// set `meta: { errorMessage }` to override the toast text.
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.skipErrorToast) return;
      const fallback = error instanceof Error ? error.message : 'Something went wrong';
      toast.error((mutation.meta?.errorMessage as string | undefined) ?? fallback);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => failureCount < MAX_QUERY_RETRIES && isRetryable(error),
      retryDelay,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error) => failureCount < MAX_MUTATION_RETRIES && isRetryable(error),
      retryDelay,
    },
  },
});
