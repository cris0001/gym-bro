import { createRouter } from '@tanstack/react-router';

import { routeTree } from '../routeTree.gen';

export const router = createRouter({ routeTree });

// Registers our router instance with TanStack Router's types so links, params,
// and search params are fully type-safe across the app.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
