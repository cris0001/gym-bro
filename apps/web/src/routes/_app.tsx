import { createFileRoute, Link, Outlet, redirect, useNavigate } from '@tanstack/react-router';

import { BrandLogo } from '@/components/brand-logo';
import { BottomNav } from '@/components/nav/bottom-nav';
import { SectionTabs } from '@/components/nav/section-tabs';
import { SidebarNav } from '@/components/nav/sidebar-nav';
import { OfflineBanner } from '@/components/offline-banner';

import { useSystemThemeSync } from '@/hooks/use-system-theme-sync';
import {
  LogoutButton,
  OnboardingSheet,
  meQueryOptions,
  useCurrentUser,
  useLogout,
} from '@/features/auth';
import { isLicenseExpired, PaywallModal, startCheckout } from '@/features/billing';
import { ActiveSessionBubble } from '@/features/sessions';
import { SettingsButton, SettingsSheet } from '@/features/settings';

// Protected layout. beforeLoad resolves the current user from the shared cache
// (fetching once if needed); a 401 throws and we redirect to the public landing
// before any child renders, so there's no flash of authenticated UI. A lapsed
// licence is confined to the dashboard (the paywall handles the rest).
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context, location }) => {
    let user;
    try {
      user = await context.queryClient.ensureQueryData(meQueryOptions);
    } catch {
      throw redirect({ to: '/' });
    }
    if (isLicenseExpired(user) && location.pathname !== '/dashboard') {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const { data: user } = useCurrentUser();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const expired = user ? isLicenseExpired(user) : false;
  useSystemThemeSync();

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <SidebarNav />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {/* Mobile-only top bar; on lg the sidebar carries the logo + logout. */}
        <header className="bg-background/80 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 backdrop-blur lg:hidden">
          {/* The logo is the way home, like in most apps. */}
          <Link to="/dashboard" className="rounded-md">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-1">
            <SettingsButton />
            <LogoutButton />
          </div>
        </header>
        <OfflineBanner />
        <SectionTabs />
        {/* Muted canvas so cards lift off the background. The grid tracks let each
            page choose its desktop placement: wide pages sit in the left-of-center
            band (lg:col-start-2 → 1fr left, 2fr right); narrow pages span the full
            width and center themselves (lg:col-span-3 mx-auto). */}
        <main className="bg-muted/40 flex-1 pb-16 lg:grid lg:grid-cols-[1fr_minmax(0,72rem)_2fr] lg:pt-3 lg:pb-0 dark:bg-background">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <ActiveSessionBubble />
      <OnboardingSheet />
      <SettingsSheet />
      {expired && user ? (
        <PaywallModal
          expiresAt={user.licenseExpiresAt}
          onRenew={startCheckout}
          onSignOut={() => logout(undefined, { onSuccess: () => void navigate({ to: '/login' }) })}
        />
      ) : null}
    </div>
  );
}
