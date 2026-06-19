import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

// Context available to every route's beforeLoad/loader. The queryClient lets
// route guards read or prefetch server state (e.g. the current user) before a
// component renders — that's how the auth gate redirects without a UI flash.
export interface RouterContext {
  queryClient: QueryClient;
}

// Root layout for every route. Becomes the app shell (nav, providers chrome)
// later; for now it just renders the matched child route.
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return <Outlet />;
}
