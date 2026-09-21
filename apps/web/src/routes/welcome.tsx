import { createFileRoute, redirect } from '@tanstack/react-router';

import { meQueryOptions } from '@/features/auth';
import { LandingPage } from '@/features/landing';

// Public marketing page (the entry point for signed-out visitors). A signed-in
// visitor is bounced to their dashboard; everyone else sees the landing.
export const Route = createFileRoute('/welcome')({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(meQueryOptions);
    } catch {
      return;
    }
    throw redirect({ to: '/' });
  },
  component: LandingPage,
});
