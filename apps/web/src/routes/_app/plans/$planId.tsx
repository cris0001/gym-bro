import { createFileRoute } from '@tanstack/react-router';

import { PlanDetail, PlansWorkspace } from '@/features/training';
import { useMediaQuery } from '@/hooks/use-media-query';

export const Route = createFileRoute('/_app/plans/$planId')({
  component: PlanDetailRoute,
});

// lg+: the workspace with this plan selected; phones get the plan page.
function PlanDetailRoute() {
  const { planId } = Route.useParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return isDesktop ? <PlansWorkspace planId={planId} /> : <PlanDetail planId={planId} />;
}
