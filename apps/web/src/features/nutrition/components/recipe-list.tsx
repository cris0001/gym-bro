import { Link } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { RecipeListItem } from '@gym-bro/shared';

import { useDeleteRecipe } from '../hooks/use-delete-recipe';
import { useRecipes } from '../hooks/use-recipes';
import { MacrosSummary } from './macros-summary';

// Recipe list. Each row links to the builder for editing; the delete button is a
// sibling of the link (not nested) and confirms first.
export function RecipeList() {
  const { data: recipes = [], isPending } = useRecipes();
  const remove = useDeleteRecipe();

  function onDelete(recipe: RecipeListItem) {
    if (window.confirm(`Delete "${recipe.name}"? It will be removed from your recipes.`)) {
      remove.mutate(recipe.id);
    }
  }

  if (isPending) {
    return <p className="text-muted-foreground p-4 text-sm">Loading…</p>;
  }
  if (recipes.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-center text-sm">
        No recipes yet. Create your first recipe.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {recipes.map((recipe) => (
        <li key={recipe.id} className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/recipes/$recipeId"
            params={{ recipeId: recipe.id }}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{recipe.name}</p>
              <p className="text-muted-foreground text-sm">{recipe.servings} servings</p>
            </div>
            <MacrosSummary macros={recipe.perServing} />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive size-11 shrink-0"
            aria-label={`Delete ${recipe.name}`}
            disabled={remove.isPending}
            onClick={() => onDelete(recipe)}
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
