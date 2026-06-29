import { createFileRoute } from '@tanstack/react-router';

import { RecipeEditPage } from '@/features/nutrition';

export const Route = createFileRoute('/_app/recipes/$recipeId')({
  component: RecipeEditRoute,
});

function RecipeEditRoute() {
  const { recipeId } = Route.useParams();
  return <RecipeEditPage recipeId={recipeId} />;
}
