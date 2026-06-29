import { createFileRoute } from '@tanstack/react-router';

import { TargetsPage } from '@/features/nutrition';

export const Route = createFileRoute('/_app/targets')({
  component: TargetsPage,
});
