import { createFileRoute } from '@tanstack/react-router';

import { StatsPage } from '@/features/stats';

export const Route = createFileRoute('/_app/stats')({
  component: StatsPage,
});
