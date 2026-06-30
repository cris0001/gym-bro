import { createFileRoute } from '@tanstack/react-router';

import { BodyPage } from '@/features/body';

export const Route = createFileRoute('/_app/body')({
  component: BodyPage,
});
