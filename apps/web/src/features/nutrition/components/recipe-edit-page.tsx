import { useRecipe } from '../hooks/use-recipe';
import { RecipeBuilder } from './recipe-builder';

// Loads a recipe, then hands it to the builder in edit mode.
export function RecipeEditPage({ recipeId }: { recipeId: string }) {
  const { data: recipe, isPending, isError } = useRecipe(recipeId);

  if (isPending) {
    return <p className="text-muted-foreground p-4 text-sm">Loading…</p>;
  }
  if (isError || !recipe) {
    return <p className="text-muted-foreground p-4 text-sm">Recipe not found.</p>;
  }
  return <RecipeBuilder editing={recipe} />;
}
