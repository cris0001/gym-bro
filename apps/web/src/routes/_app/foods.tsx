import { createFileRoute } from '@tanstack/react-router';

import { FoodsPage } from '@/features/nutrition';

export const Route = createFileRoute('/_app/foods')({
  component: FoodsPage,
});
