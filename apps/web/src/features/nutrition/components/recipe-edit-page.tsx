import { useRecipe } from '../hooks/use-recipe';
import { useNutritionTranslation } from '../i18n';
import { RecipeBuilder } from './recipe-builder';

interface RecipeEditPageProps {
  recipeId: string;
}

// Loads a recipe, then hands it to the builder in edit mode.
export function RecipeEditPage({ recipeId }: RecipeEditPageProps) {
  const t = useNutritionTranslation();
  const { data: recipe, isPending, isError } = useRecipe(recipeId);

  if (isPending) {
    return <p className="text-muted-foreground p-4 text-sm">{t.common.loading}</p>;
  }
  if (isError || !recipe) {
    return <p className="text-muted-foreground p-4 text-sm">{t.recipes.notFound}</p>;
  }
  return <RecipeBuilder editing={recipe} />;
}
