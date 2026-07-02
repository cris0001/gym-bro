import { Link } from '@tanstack/react-router';
import { ChevronRight, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { RecipeListItem } from '@gym-bro/shared';

import { useDeleteRecipe } from '../hooks/use-delete-recipe';
import { useRecipes } from '../hooks/use-recipes';

// Recipe list. Each row (name over per-serving macros) links to the builder for
// editing; the delete button is a sibling of the link (not nested) and confirms first.
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
        <li
          key={recipe.id}
          className="hover:bg-muted/50 active:bg-muted flex items-center gap-2 px-4 py-3 transition-colors"
        >
          <Link
            to="/recipes/$recipeId"
            params={{ recipeId: recipe.id }}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{recipe.name}</p>
              <p className="text-muted-foreground text-sm">
                {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'} ·{' '}
                {Math.round(recipe.perServing.kcal)} kcal · P{' '}
                {Math.round(recipe.perServing.proteinG)} · C {Math.round(recipe.perServing.carbsG)}{' '}
                · F {Math.round(recipe.perServing.fatG)}
                <span className="text-xs"> / serving</span>
              </p>
            </div>
            <ChevronRight className="text-muted-foreground size-5 shrink-0" />
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
