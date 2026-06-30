import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Dumbbell } from 'lucide-react';

import { BottomNav } from '@/components/nav/bottom-nav';
import { SectionTabs } from '@/components/nav/section-tabs';
import { SidebarNav } from '@/components/nav/sidebar-nav';
import { LogoutButton, OnboardingSheet, meQueryOptions } from '@/features/auth';

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
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <SidebarNav />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* Mobile-only top bar; on lg the sidebar carries the logo + logout. */}
        <header className="bg-background/80 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 backdrop-blur lg:hidden">
          <span className="flex items-center gap-2 text-lg font-bold">
            <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
              <Dumbbell className="size-4" />
            </span>
            Gym Bro
          </span>
          <LogoutButton />
        </header>
        <SectionTabs />
        <main className="flex-1 pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <OnboardingSheet />
    </div>
  );
}
