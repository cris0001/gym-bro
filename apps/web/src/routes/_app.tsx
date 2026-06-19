import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { meQueryOptions } from '@/features/auth';

// Protected layout. beforeLoad resolves the current user from the shared cache
// (fetching once if needed); a 401 throws and we redirect to /login before any
// child renders, so there's no flash of authenticated UI.
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(meQueryOptions);
    } catch {
      throw redirect({ to: '/login' });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return <Outlet />;
}
