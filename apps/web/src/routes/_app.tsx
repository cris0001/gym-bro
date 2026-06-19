import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { LogoutButton, meQueryOptions } from '@/features/auth';

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
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-background/80 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 backdrop-blur">
        <span className="text-lg font-bold">GM</span>
        <LogoutButton />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
