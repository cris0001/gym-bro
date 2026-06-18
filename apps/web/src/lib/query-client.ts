import { QueryClient } from '@tanstack/react-query';

// Single shared QueryClient. Defaults tuned for a personal app:
// - staleTime 60s: data stays fresh briefly, avoiding refetch storms on
//   navigation.
// - retry 1: one retry for transient blips; not worth hammering on real errors.
// - refetchOnWindowFocus off: no surprise refetches when tabbing back at the gym.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
