import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Single shared QueryClient. Defaults tuned for a personal app:
// - staleTime 60s: data stays fresh briefly, avoiding refetch storms on
//   navigation.
// - retry 1: one retry for transient blips; not worth hammering on real errors.
// - refetchOnWindowFocus off: no surprise refetches when tabbing back at the gym.
//
// A MutationCache onError surfaces EVERY failed mutation as an error toast, so no
// write silently fails. A mutation can opt out with `meta: { skipErrorToast: true }`
// (e.g. when it renders its own inline error), and set `meta: { errorMessage }` to
// override the toast text.
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
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
