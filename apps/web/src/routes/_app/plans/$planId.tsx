import { createFileRoute } from '@tanstack/react-router';

import { PlanDetail } from '@/features/training';

export const Route = createFileRoute('/_app/plans/$planId')({
  component: PlanDetailRoute,
});

function PlanDetailRoute() {
  const { planId } = Route.useParams();
  return <PlanDetail planId={planId} />;
}
