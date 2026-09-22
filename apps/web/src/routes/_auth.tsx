import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { meQueryOptions } from '@/features/auth';

// Public layout for the auth pages. If the user is already signed in, bounce
// them to the dashboard instead of showing login/register. The split-panel chrome
// lives in each page's <AuthShell>, so this is just the auth-gate + outlet.
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(meQueryOptions);
    } catch {
      return;
    }
    throw redirect({ to: '/dashboard' });
  },
  component: Outlet,
});
