import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import { queryClient } from '@/lib/query-client';

import { router } from './router';

// Root application component. QueryClient provides server-state caching to the
// whole tree; the router drives navigation.
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
