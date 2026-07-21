import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/query-client';

import { router } from './router';

// Root application component. QueryClient provides server-state caching to the
// whole tree; the router drives navigation; Toaster hosts global toasts; the single
// ConfirmDialog backs the promise-based useConfirm.
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      <ConfirmDialog />
    </QueryClientProvider>
  );
}
