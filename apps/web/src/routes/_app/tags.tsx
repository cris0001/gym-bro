import { createFileRoute } from '@tanstack/react-router';

import { TagsPage } from '@/features/training';

export const Route = createFileRoute('/_app/tags')({
  component: TagsPage,
});
