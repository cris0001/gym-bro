import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { BrandMark } from '@/components/brand-mark';
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
    <main className="bg-background flex min-h-dvh flex-col justify-center p-6">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <BrandMark className="size-12" />
          <span className="font-heading text-xl font-semibold">Gym Bro</span>
        </div>
        <div className="bg-card rounded-2xl border p-6">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
