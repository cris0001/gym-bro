import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { meQueryOptions } from '@/features/auth';

// Public layout for the auth pages. If the user is already signed in, bounce
// them to the dashboard instead of showing login/register.
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(meQueryOptions);
    } catch {
      return;
    }
    throw redirect({ to: '/' });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <main className="flex min-h-dvh flex-col justify-center p-6">
      <div className="mx-auto w-full max-w-sm">
        <Outlet />
      </div>
    </main>
  );
}
