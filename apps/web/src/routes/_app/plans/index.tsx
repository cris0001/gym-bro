import { createFileRoute } from '@tanstack/react-router';

import { PlansPage, PlansWorkspace } from '@/features/training';
import { useMediaQuery } from '@/hooks/use-media-query';

export const Route = createFileRoute('/_app/plans/')({
  component: PlansRoute,
});

// lg+: the three-column workspace; phones keep the one-page-per-level flow.
function PlansRoute() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return isDesktop ? <PlansWorkspace /> : <PlansPage />;
}
