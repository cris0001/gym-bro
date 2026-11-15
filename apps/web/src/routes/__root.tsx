import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useSeoMeta } from '@/hooks/use-seo-meta';
import { useThemedFavicon } from '@/hooks/use-themed-favicon';
import { applyDateLocale } from '@/lib/i18n/date-locale';
import { useLocaleStore } from '@/stores/locale.store';

// Context available to every route's beforeLoad/loader. The queryClient lets
// route guards read or prefetch server state (e.g. the current user) before a
// component renders — that's how the auth gate redirects without a UI flash.
export interface RouterContext {
  queryClient: QueryClient;
}

// Root layout for every route. Renders the matched child, keeps the document's
// <html lang> in sync with the chosen UI language, and tints the favicon to the palette.
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const locale = useLocaleStore((s) => s.locale);
  // Set during render (idempotent) so the first paint already formats dates in the
  // chosen language; components that format dates re-render on the locale change.
  applyDateLocale(locale);
  useThemedFavicon();
  useSeoMeta();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <Outlet />;
}
