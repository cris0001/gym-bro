import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useLocaleStore } from '@/stores/locale.store';

// Context available to every route's beforeLoad/loader. The queryClient lets
// route guards read or prefetch server state (e.g. the current user) before a
// component renders — that's how the auth gate redirects without a UI flash.
export interface RouterContext {
  queryClient: QueryClient;
}

// Root layout for every route. Renders the matched child and keeps the document's
// <html lang> in sync with the chosen UI language.
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const locale = useLocaleStore((s) => s.locale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <Outlet />;
}
