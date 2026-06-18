import { createRootRoute, Outlet } from '@tanstack/react-router';

// Root layout for every route. Becomes the app shell (nav, providers chrome)
// later; for now it just renders the matched child route.
export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return <Outlet />;
}
