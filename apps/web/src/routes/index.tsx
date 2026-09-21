import { createFileRoute, redirect } from '@tanstack/react-router';

import { meQueryOptions } from '@/features/auth';
import { LandingPage } from '@/features/landing';

// Public home page (the landing). A signed-in visitor is sent straight to the app
// dashboard; everyone else sees the marketing page.
export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(meQueryOptions);
    } catch {
      return;
    }
    throw redirect({ to: '/dashboard' });
  },
  component: LandingPage,
});
