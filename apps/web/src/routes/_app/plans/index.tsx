import { createFileRoute } from '@tanstack/react-router';

import { PlansPage } from '@/features/training';

export const Route = createFileRoute('/_app/plans/')({
  component: PlansPage,
});
