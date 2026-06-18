import { RouterProvider } from '@tanstack/react-router';

import { router } from './router';

// Root application component — drives the type-safe TanStack Router.
export function App() {
  return <RouterProvider router={router} />;
}
