import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/query-client';

import { router } from './router';

// Root application component. QueryClient provides server-state caching to the
// whole tree; the router drives navigation; Toaster hosts global toasts; the single
// ConfirmDialog backs the promise-based useConfirm. The Query devtools (floating
// button, bottom-left) render in dev only — the package swaps itself for a no-op in
// production builds.
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      <ConfirmDialog />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
