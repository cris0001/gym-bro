import { createFileRoute } from '@tanstack/react-router';

import { RecipeBuilder } from '@/features/nutrition';

export const Route = createFileRoute('/_app/recipes/new')({
  component: NewRecipeRoute,
});

function NewRecipeRoute() {
  return <RecipeBuilder editing={null} />;
}
