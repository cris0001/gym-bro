import { createRouter } from '@tanstack/react-router';

import { queryClient } from '@/lib/query-client';

import { routeTree } from '../routeTree.gen';

// The same singleton QueryClient the app's QueryClientProvider uses, handed to
// the router as context so loaders/guards share one cache with the React tree.
export const router = createRouter({
  routeTree,
  context: { queryClient },
});

// Registers our router instance with TanStack Router's types so links, params,
// and search params are fully type-safe across the app.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
