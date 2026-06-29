import { createFileRoute } from '@tanstack/react-router';

import { RecipesPage } from '@/features/nutrition';

export const Route = createFileRoute('/_app/recipes/')({
  component: RecipesPage,
});
